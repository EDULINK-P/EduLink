export const validateAcademicEmail = async (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.edu$/;
  return emailRegex.test(email);
};
