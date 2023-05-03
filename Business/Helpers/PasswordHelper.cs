using System.Security.Cryptography;
using System.Text;
using System;

namespace ChatApp.Business.Helpers
{
    public class PasswordHelper
    {
        public string GenerateSalt()
        {
            byte[] salt;
            new RNGCryptoServiceProvider().GetBytes(salt = new byte[16]);
            return Convert.ToBase64String(salt);
        }

        public string GetHash(string plainPassword, string salt)
        {
            byte[] byteArray = Encoding.Unicode.GetBytes(string.Concat(plainPassword, salt));
            SHA256Managed sha256 = new();

            byte[] hashedBytes = sha256.ComputeHash(byteArray);
            return Convert.ToBase64String(hashedBytes);
        }

        public bool CompareHashedPasswords(string userInput, string ExistingPassword, string salt)
        {
            string UserInputHashedPassword = GetHash(userInput, salt);
            return ExistingPassword == UserInputHashedPassword;
        }
    }
}
