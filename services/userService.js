//userService
const sendmail = require('../helpers/sendMail').sendMail
var jwt = require('jsonwebtoken')

exports.register = async function(userObj){
    try{
		const mysql = require('../helpers/db').mysql

		const checkIfExists = await mysql.query("Select * from user where email = ?", [userObj.email])
		if(checkIfExists.length){
			 return {
				 status: "bad",
				 message: "User already exists",
				 token: null
			 }
		}
		await mysql.query("insert into user (fname, lname, email, is_admin) Values(?,?,?,?)", [userObj.fname, userObj.lname, userObj.email, 0])
		
		const dbObj = await mysql.query("select * from user where email = ?", [userObj.email])
		await mysql.end()
		const token = await jwt.sign({user: dbObj[0]}, process.env.SECRET);
		await sendmail(userObj.email)
		return {
			status: "Good",
			message: "user registered successfully",
			token: token,
			userID: dbObj[0].id 
		}
    }
    catch(err){
		return {
			status: "bad",
			message: err.message,
			token: null
		}
    }
}

exports.lockAccount = async function(id, task){
	try{
		const mysql = require('../helpers/db').mysql
		if (task === "lock"){
			await mysql.query('update user set isLocked = ? where id = ?', [1, id])
		}else if(task === "unlock"){
			await mysql.query('update user set isLocked = ? where id = ?', [0, id])
		}else{
			return {
				status :"error",
				message: "task not recognized"
			}
		}
		await mysql.end()
		return {
			status: "Done",
			message: `user account successfully ${task}ed`
		}
	}
	catch(err){
		return {
			status: "error",
			message: err.message
		}
	}
}
