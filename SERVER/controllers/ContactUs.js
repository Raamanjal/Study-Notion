const {contactUsEmail}=require("../mail_templates/contactFormRes");
const mailSender= require("../utils/mailSender");

exports.contactUsController = async(req,res)=>{
    const{email,firstName,lastName,message,phoneNo,countryCode}= req.body;
    console.log(req.body);

    try{
        const emailRes = await mailSender(
            email,
            "Your Data send Successfully",
            contactUsEmail(email,firstName,lastName,message,phoneNo,countryCode)
        )
        console.log("Email res: ", emailRes);
        return res.json({
            success:true,
            message:"Email Sent Successfully",
        })
    } catch(error){
        console.log("Error",error)
        console.log("Error message :",error.message)
        return res.status(500).json({
            success:false,
            message:"Something went Wrong...",
        })
    }
}