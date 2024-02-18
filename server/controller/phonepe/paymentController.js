const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const { createHash } = require("crypto");
const { log } = require("console");

require("dotenv").config();

const newPayment = async (req, res) => {
  try {
    const { amount, number } = req.body;
    const transactionid = "Tr-" + uuidv4().toString(36).slice(-6);
    const payload = {
      merchantId: process.env.MERCHANT_ID,
      merchantTransactionId: transactionid,
      merchantUserId: "MUID-" + uuidv4().toString(36).slice(-6),
      amount: amount * 100,
      redirectUrl: `http://localhost:5000/api/status/${transactionid}`,
      // redirectUrl: `http://localhost:5000/`,
      redirectMode: "POST",
      callbackUrl: `http://localhost:3000/api/status/${transactionid}`,
      mobileNumber: `${number}`,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };

    const dataPayload = JSON.stringify(payload);

    const dataBase64 = Buffer.from(dataPayload).toString("base64");

    const fullURL = dataBase64 + "/pg/v1/pay" + process.env.SALT_KEY;
    const dataSha256 = createHash("sha256").update(fullURL).digest("hex");

    const checksum = dataSha256 + "###" + 1;

    const UAT_PAY_API_URL =
      "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";

    const response = await axios.post(
      UAT_PAY_API_URL,
      {
        request: dataBase64,
      },
      {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          "X-VERIFY": checksum,
        },
      }
    );

    // axios.request(response).then(function (response) {
    //   return res
    //     .status(200)
    //     .send(response.data.data.instrumentResponse.redirectInfo.url);
    // });
    // axios.

    const redirectUrl = response.data.data.instrumentResponse.redirectInfo.url;
    // console.log(redirectUrl);

    res.status(200).send({ redirectUrl });

    // const redirect = response.data.data.instrumentResponse.redirectInfo.url;
    // res.redirect(redirect);
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }

  // const prod_URL = "https://api.phonepe.com/apis/hermes";
  // const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay"
  // https://api.phonepe.com/apis/hermes
  //   const prod_URL =
  //     "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";
  //   const options = {
  //     method: "POST",
  //     url: prod_URL,
  //     headers: {
  //       accept: "application/json",
  //       "Content-Type": "application/json",
  //       "X-VERIFY": checksum,
  //     },
  //     data: {
  //       request: dataBase64,
  //     },
  //   };

  //   axios
  //     .request(options)
  //     .then(function (response) {
  //       console.log(response.data);
  //       return res.redirect(
  //         response.data.data.instrumentResponse.redirectInfo.url
  //       );
  //     })
  //     .catch(function (error) {
  //       console.error(error);
  //     });
  // } catch (error) {
  //   res.status(500).send({
  //     message: error.message,
  //     success: false,
  //   });
  // }
};

const checkStatus = async (req, res) => {
  const merchantTransactionId = res.req.body.transactionId;
  const merchantId = res.req.body.merchantId;

  //   const keyIndex = 1;
  //   const string =
  //     `/pg/v1/status/${merchantId}/${merchantTransactionId}` +
  //     salt_key;
  //   // const sha256 = crypto.createHash("sha256").update(string).digest("hex");
  //   const sha256 = createHash("sha256").update(string).digest("hex");
  //   const checksum = sha256 + "###" + keyIndex;

  //   const options = {
  //     method: "GET",
  //     url: `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${merchantTransactionId}`,
  //     headers: {
  //       accept: "application/json",
  //       "Content-Type": "application/json",
  //       "X-VERIFY": checksum,
  //       "X-MERCHANT-ID": `${merchantId}`,
  //     },
  //   };

  //   // CHECK PAYMENT STATUS
  //   axios
  //     .request(options)
  //     .then(async (response) => {
  //       if (response.data.success === true) {
  //         const url = `http://localhost:3000/success`;
  //         return res.redirect(url);
  //       } else {
  //         const url = `http://localhost:3000/failure`;
  //         return res.redirect(url);
  //       }
  //     })
  //     .catch((error) => {
  //       console.error(error);
  //     });
  // };

  const st =
    `/pg/v1/status/${merchantId}/${merchantTransactionId}` +
    process.env.SALT_KEY;
  // console.log(st)
  const dataSha256 = createHash("sha256").update(st).digest("hex");
  // const dataSha256 = sha256(st);

  const checksum = dataSha256 + "###" + 1;

  const options = {
    method: "GET",
    url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${merchantTransactionId}`,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
      "X-MERCHANT-ID": `${merchantId}`,
    },
  };

  // CHECK PAYMENT STATUS
  const response = await axios.request(options);

  console.log("r===", response.data.code);
  if (response.data.code == "PAYMENT_SUCCESS") {
    const url = `http://localhost:3000/success`;
    return res.redirect(url);
  } else {
    const url = `http://localhost:3000/failure`;
    return res.redirect(url);
  }
};
module.exports = {
  newPayment,
  checkStatus,
};
