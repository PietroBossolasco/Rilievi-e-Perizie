// import
import bcrypt from "bcryptjs" // + @types
import {MongoClient, ObjectId}  from "mongodb";
import dotenv from "dotenv";

// config
dotenv.config({ path: ".env" });
const DBNAME = "Perizie";
const CONNECTION_STRING:any = process.env.connectionString;


let connection = new MongoClient(CONNECTION_STRING);
connection.connect().then((client: any) => {
	const COLLECTION = client.db(DBNAME).collection('user');
	COLLECTION.find().project({"password":1}).toArray(function(err:any, vet:{"_id":ObjectId, "password":string}[]) {
		if(err){
			console.log("Errore esecuzione query" + err.message)
			client.close();
		}
		else
		{
			for(let item of vet){
				let oid = new ObjectId(item["_id"]);  
				// le stringhe bcrypt inizano con $2[ayb]$ e sono lunghe 60
				let regex = new RegExp("^\\$2[ayb]\\$.{56}$");
				// se la password corrente non è in formato bcrypt
				if (!regex.test(item["password"]))      
				{
					console.log("aggiornamento in corso ... ", item);
					let newPass = bcrypt.hashSync(item["password"], 10)					
					COLLECTION.updateOne({"_id":oid}, {"$set":{"password":newPass}}, function(err:Error, data:any){
						aggiornaCnt(vet.length, client)
						if(err)
							console.log("errore aggiornamento record", item["_id"], err.message)							
					})
				}
				else 
					aggiornaCnt(vet.length, client)
			}
			// client.close();  NOK !!
		}
	})
})
.catch((err: any) => {
    console.log("Errore di connessione al database");
}) 


let cnt=0;
function aggiornaCnt(length:number, client:MongoClient){
	cnt++;
	if(cnt==length){
		console.log("Aggiornamento completato correttamente")
		client.close();
	}	
}