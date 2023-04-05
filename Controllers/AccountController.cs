using System;
using System.Collections;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using ChatApp.Business.Helpers;
using ChatApp.Business.ServiceInterfaces;
using ChatApp.Context.EntityClasses;
using ChatApp.Models.Auth;
using ChatApp.Models.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace ChatApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [AllowAnonymous]
    public class AccountController : ControllerBase
    {
        #region Private fields
        private readonly IConfiguration _config;
        private readonly IProfileService _profileService;
        #endregion

        #region Constructor
        public AccountController(IConfiguration config, IProfileService profileService)
        {
            _config = config;
            _profileService = profileService;
        }
        #endregion

        #region Endpoints

        [HttpPost("Login")]
        public IActionResult Login([FromBody] LoginModel loginModel)
        {

            var user = _profileService.CheckPassword(loginModel, out string curSalt);

            if (user != null)
            {
                //check for password
                if (CompareHashedPasswords(loginModel.Password, user.Password, curSalt))
                {
                    var tokenString = GenerateJSONWebToken(user);
                    return Ok(new { token = tokenString });
                }
            }

            return Unauthorized(new { Message = "Invalid Credentials." });
        }

        [HttpPost("Register")]
        public IActionResult Register([FromBody] RegisterModel registerModel)
        {

            var salt = GenerateSalt();

            //hash password
            var hashedPass = GetHash(registerModel.Password, salt);

            //change password with new hashed password
            registerModel.Password = hashedPass;

            var user = _profileService.RegisterUser(registerModel, salt);
            if (user != null)
            {
                var tokenString = GenerateJSONWebToken(user);
                return Ok(new { token = tokenString, user = user });
            }

            return BadRequest(new { Message = "User Already Exists. Please use different email and UserName." });
        }
        #endregion

        #region Methods
        private string GenerateJSONWebToken(Profile profileInfo)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[] {
                    new Claim(JwtRegisteredClaimNames.Sub, profileInfo.UserName),
                    new Claim(JwtRegisteredClaimNames.Email, profileInfo.Email),
                    new Claim(ClaimsConstant.FirstNameClaim, profileInfo.FirstName),
                    new Claim(ClaimsConstant.LastNameClaim, profileInfo.LastName),
                    //new Claim(ClaimsConstant.ImageUrlClaim, profileInfo.ImageUrl),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
                    };

            var token = new JwtSecurityToken(_config["Jwt:Issuer"],
                _config["Jwt:Issuer"],
                claims,
                expires: DateTime.Now.AddSeconds(120),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string GenerateSalt()
        {
            byte[] salt;
            new RNGCryptoServiceProvider().GetBytes(salt = new byte[16]);
            return Convert.ToBase64String(salt);
        }

        private string GetHash(string plainPassword,  string salt)
        {
            byte[] byteArray = Encoding.Unicode.GetBytes(string.Concat(plainPassword, salt));
            SHA256Managed sha256 = new();

            byte[] hashedBytes = sha256.ComputeHash(byteArray);
            return Convert.ToBase64String(hashedBytes);
        }

        private bool CompareHashedPasswords(string userInput, string ExistingPassword, string salt)
        {
            string UserInputHashedPassword = GetHash(userInput, salt);
            return ExistingPassword == UserInputHashedPassword;
        }
        #endregion

    }
}