using System;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using ChatApp.Business.Helpers;
using ChatApp.Business.ServiceInterfaces;
using ChatApp.Context.EntityClasses;
using ChatApp.Hubs;
using ChatApp.Models.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Google.Apis.Auth;
using System.Linq;

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
        private readonly IHubContext<MessageHub> _hub;
        #endregion

        #region Constructor
        public AccountController(IConfiguration config, IProfileService profileService, IHubContext<MessageHub> hub)
        {
            _config = config;
            _profileService = profileService;
            _hub = hub;
        }
        #endregion

        #region Endpoints

        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] LoginModel loginModel)
        {
            try
            {
                var user = _profileService.CheckPassword(loginModel.Username, out string curSalt);

                if (user != null)
                {
                    //check for password
                    if (CompareHashedPasswords(loginModel.Password, user.Password, curSalt))
                    {

                        await _hub.Clients.All.SendAsync("updateProfileStatus", "available", user.UserName);

                        var tokenString = GenerateJSONWebToken(user);
                        return Ok(new { token = tokenString });
                    }
                }

                return Unauthorized(new { Message = "Invalid Credentials." });
            }
            catch (Exception)
            {
                return StatusCode((int) HttpStatusCode.InternalServerError);
            }
        }

        [HttpPost("Register")]
        public IActionResult Register([FromBody] RegisterModel registerModel)
        {
            try
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
                    return Ok(new { token = tokenString, user = ModelMapper.ConvertProfileToDTO(user) });
                }

                return BadRequest(new { Message = "User Already Exists. Please use different email and UserName." });
            }
            catch (Exception)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        [HttpPost("googleLogin")]
        public async Task<IActionResult> GoogleLogin([FromHeader] string GToken)
        {
            try
            {
                GoogleJsonWebSignature.Payload payload = await GoogleJsonWebSignature.ValidateAsync(GToken);

                var user = _profileService.GoogleLogin(payload);

                if (user == null)
                {
                    return BadRequest("User is already Registered!");
                }

                var tokenString = GenerateJSONWebToken(user);

                return Ok(new { user = ModelMapper.ConvertProfileToDTO(user), token = tokenString });
            }
            catch (Exception e)
            {
                return BadRequest("Invalid data. Try again");
            }
        }

        [Authorize]
        [HttpPost("ChangePassword")]
        public IActionResult ChangePassword(ChangePasswordModel Obj)
        {
            try
            {
                var userName = JwtHelper.GetUsernameFromRequest(Request);
                var user = _profileService.GetUserByUsername(userName);

                if (user != null)
                {

                    //if google user and password is provided
                    if(user.Password == null && (Obj.CurrentPassword != null && Obj.CurrentPassword.Count() != 0))
                    {
                        return BadRequest();
                    }

                    //if not google user and password is not provided
                    if(user.Password != null && (Obj.CurrentPassword == null || Obj.CurrentPassword.Count() == 0))
                    {
                        return BadRequest();
                    }

                    //if google user update password directly
                    if(user.Password == null)
                    {
                        var salt = GenerateSalt();

                        //hash password
                        var hashedPass = GetHash(Obj.Password, salt);

                        _profileService.ChangePassword(salt, hashedPass, user);

                        return Ok();
                    }

                    var curSalt = _profileService.GetSalt(user.Id);
                    //check for password
                    if (CompareHashedPasswords(Obj.CurrentPassword, user.Password, curSalt))
                    {
                        var salt = GenerateSalt();

                        //hash password
                        var hashedPass = GetHash(Obj.Password, salt);

                        _profileService.ChangePassword(salt, hashedPass, user);

                        return Ok();
                    }
                    else
                    {
                        return BadRequest("Invalid passeword.");
                    }
                }

                return Ok("Bad Request!");

            }
            catch (Exception)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

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
                    new Claim(ClaimsConstant.DesignationClaim, profileInfo.UserDesignation.Role),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(_config["Jwt:Issuer"],
                _config["Jwt:Issuer"],
                claims,
                expires: DateTime.Now.AddMinutes(120),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string GenerateSalt()
        {
            byte[] salt;
            new RNGCryptoServiceProvider().GetBytes(salt = new byte[16]);
            return Convert.ToBase64String(salt);
        }

        private string GetHash(string plainPassword, string salt)
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