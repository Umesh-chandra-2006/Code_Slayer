const axios = require("axios");

const verifyEmail = async (email) => {
  try {
    const { data } = await axios.get(
      `https://emailvalidation.abstractapi.com/v1/?api_key=c0223b52ce67465bb8d9c7f24090a853&email=${email}`
    );

    return data.is_valid_format.value && data.deliverability == "DELIVERABLE";
  } catch (err) {
    console.log("Email verification failed", err);
    return false;
  }
};

module.exports = verifyEmail;
