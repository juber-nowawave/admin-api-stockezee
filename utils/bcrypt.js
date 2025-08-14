import bcrypt from "bcrypt";

export const encode_bcrypt = async (value) => {
  try {
    const encode = await bcrypt.hash(value.toString(), 10);
    return encode;
  } catch (error) {
    console.error("Error hashing password:", error);
  }
};

export const decode_bcrypt = async (user_value, stored_value) => {
  try {
    const decode = await bcrypt.compare(user_value, stored_value);
    return decode;
  } catch (error) {
    console.error("Error comparing hash:", error);
  }
};
