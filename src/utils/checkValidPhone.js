// ref: https://fozg.net/blog/validate-vietnamese-phone-number
exports.isVietnamesePhoneNumberValid = (number) =>
  /(((\+|)84)|0)(3|5|7|8|9)+([0-9]{8})\b/.test(number);
