const cheerio = require('cheerio');
const Axios = require('axios');
const fs = require('fs');
const nodemailer =require('nodemailer');

var list =JSON.parse(fs.readFileSync('./prices.json','utf-8'));

const links = ['https://www.amazon.in/Philips-DuraPower-Trimmer-BT3203-15/dp/B07CXB2ZVB/ref=sr_1_2?dchild=1&keywords=philips+trimmer&qid=1595391196&sr=8-2','https://www.amazon.in/Amazfit-Battery-Always-Display-Resistance/dp/B0892SF2MJ/ref=sr_1_5?crid=3PEC8JVC0GQLO&dchild=1&keywords=huami%2Bamazfit%2Bgts%2Bsmart%2Bwatch&qid=1595419013&sprefix=huami%2B%2Caps%2C796&sr=8-5&th=1','https://www.amazon.in/Infinity-Glide-120-Earphones-Sweatproof/dp/B082MDMW3X/ref=sr_1_1?crid=1CB49OTYUFFFM&dchild=1&keywords=infinity+jbl+glide+120&qid=1595419485&smid=A14CZOWI0VEHLG&sprefix=infinity+jbl+glide%2Caps%2C1281&sr=8-1']
const emails = ['amanaks195@gmail.com','pathak.gaurav29@gmail.com','rsaurabh350@gmail.com']

const url= async(link,email,oldprice,product)=>{

    const {data:html} = await Axios.default.get(link);

    const $ =  cheerio.load(html);

    var image = $('.a-dynamic-image.a-stretch-vertical').attr('data-a-dynamic-image');
    var title =$('#productTitle').text().trim();

    image = JSON.parse(image);

    for(key in image){
        image=key;
        break;
    }

    var price = $('.a-size-medium.a-color-price.priceBlockBuyingPriceString').text().trim();

    if(price===''){
        console.log("Currently unavailable.")
        price=$('.a-size-medium.a-color-price.priceBlockDealPriceString').text().trim();
        if(price===''){
            console.log("not av")
        return
        }
    }


    price=price.substring(2,price.length-3).replace(',','');


    if(price<oldprice){
        list[product]= parseInt(price);
    sendEmail(oldprice,price,link,image,email,title);
    fs.writeFileSync('./prices.json',JSON.stringify(list)); 
    }
    
}

    
const sendEmail=async(oldPrice,newPrice,url,image,email,title)=>{
    const user =email;
    const pass = "pass";

    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user,// generated ethereal user
          pass // generated ethereal password
        },
      });
    
      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: `"Nirmal 👻" <${user}>`, // sender address
        to: email, // list of receivers
        subject: "!!!!!!!Price Changed !!!!!!!!!!!!!!!!!!!", // Subject line
        html:`<h1>${title}</h1> <h3>The price fell down from ₹ ${oldPrice} to ₹ ${newPrice}</h3> <br> <br/> <h3>${url}</h3> <img src='${image}' alt='null'></img>`
      });

}
    

    var count =0;
    async function run(){
    for(product in list){
       await url(links[count],emails[count],list[product],product);
        count++;
    }
    }
    
    run();