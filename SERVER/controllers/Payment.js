const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User =require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail}= require("../mail_templates/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");


//capture the payment and initiate the Razorpay order

exports.capturePayment= async (req,res) =>{
    //get courseId and UserId
    const {course_id}= req.body;
    const userId = req.user.id;
    //validation
    //valid courseId
    if(!course_id){
        return res.json({
            success:false,
            message:"Please provide valid course ID",
            })
        }
        //valid courseDetail
        let course;
        try{
            course = await Course.findById(course_id);
            if(!course){
                return res.json({
                    success:false,
                    messasge:"Could not find the user",
                })
            }

            //user already pay for the same course
            const uid = new mongoose.Types.ObjectId(userId);
            if(course.studentsEnrolled._id === uid){
                return res.status(200).json({
                    success:false,
                    message:"Student is already enrolled",
                });
            }
        } 
        catch(error){
            console.error(error);
            return res.status(500).json({
                success:false,
                message:error.message,
            })
        }

        //order create
        const amount = course.price;
        const currency= 'INR';

        const options = {
            amount : amount*100,
            currency,
            receipt:Math.random(Date.now()).toString(),
            notes:{
                courseId:course_id,
                userid,
            }
        };

        try{
            //initiate the payment using razorpay
            const paymentResponse = await instance.orders.create(options);
            console.log(paymentResponse);

            //return response

            return res.status(200).json({
                success:true,
                courseName:course.courseName,
                courseDescription:course.courseDescription,
                thumbnail:course.courseImage,
                orderId:paymentResponse.id,
                currency:paymentResponse.currency,
                amount:paymentResponse.amount,
            })
        }
        catch(error){
            console.error(error.message);
            return res.status(500).json({
                success:false,
                message:"Could not initiate order",
            })
        }
        //return response
    }


    //authorization verify Signature

exports.verfySignature = async (req,res) =>{

    const webhookSecret = "123456"; 

    const signature= req.headers("x-razorpay-signature");
    
    const shasum= crypto.createHmac("sha256", webhookSecret); 
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if(signature ===digest){
        console.log("Payment is authorized");

        const{courseId,userId} = req.body.payload.payment.entity.notes;

        try{
                //fullfil the action

                //find the course and enroll the student in it
                const enrolledCourse= await Course.findByIdAndUpdate(
                                                                    {_id:courseId},
                                                                    {$push:{studentsEnrolled:userId}},
                                                                    {new:true},
            );

                if(!enrollCourse){
                    return res.status(500).json({
                        success:false,
                        message:'Course not found',
                    })
                }
                console.log(enrolledCourse);

                //find the student and add the course to their list of enrolled course
                const enrolledStudent = await User.findByIdAndUpdate(
                                                                     {_id:userId},
                                                                     {$push:{courses:courseId}},
                                                                     {new:true},                  
                );
                console.log(enrolledCourse);

                //mail sent krdo confirmation wala

                const mailResponse = await mailSender(
                    enrolledStudent.email,
                    "Congratulations from CodeHelp",
                    "Congratulations,you are enrolled into new CodeHelp Course",
                );

                console.log(emailResponse);
                return res.status(200).json({
                    successs:true,
                    message:"Signature verified and course added",
                });
        }
        catch(error){
            console.log(error);
            return res.status(500).json({
                success:false,
                message:error.message,
            })
        }
    }
    else{
        return res.status(400).json({
            success:false,
            message:"Invalid Request", 
        })
    }
}

