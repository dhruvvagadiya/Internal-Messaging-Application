using System;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using ChatApp.Business.Helpers;
using ChatApp.Business.ServiceInterfaces;
using ChatApp.Context.EntityClasses;
using ChatApp.Models.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace ChatApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [AllowAnonymous]
    public class UserController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly IUserService _userService;

        public UserController(IConfiguration config, IUserService userService)
        {
            _config = config;
            _userService = userService;
        }


        [HttpPut("{username}")]
        public IActionResult UpdateProfile([FromForm] UpdateModel updateModel, string username)
        {
            //get updated user
            var updated = _userService.UpdateUser(updateModel, username);

            if (updated.UserName == null || updated.UserName.Length == 0)
            {
                return BadRequest(new { Message = "Email already exists. Please try again" });
            }

            if (updated != null)
            {
                var tokenString = GenerateJSONWebToken(updated);
                return Ok(new { token = tokenString, user = updated });
            }

            //error
            return BadRequest(new { Message = "Error occured while updating user profile. Please try again" });
        }

        [HttpGet("{username}")]
        public IActionResult GetUser(string username)
        {
            var user = _userService.GetUser(e => e.UserName == username, false);
            var userDto = ModelMapper.ConvertProfileToDTO(user); 
            return Ok(userDto);
        }

        [HttpGet("GetUsers/{name}")]
        public IActionResult GetUsers(string? name, [FromHeader] string authorization)
      {
            string username = JwtHelper.GetUsernameFromRequest(Request);
            var userList = _userService.GetAll(name.ToUpper().Trim(), username);
            return Ok(new { data = userList });
        }


        //[HttpGet("GetImage")]
        //public async Task<IActionResult> GetImage([FromHeader] string authorization)
        //{
        //    //retrive token from request headers
        //    var token = JwtHelper.GetToken(authorization.Split()[1]);

        //    //get username from claims
        //    string username = token.Claims.First(c => c.Type == "sub").Value;
        //    //string path = token.Claims.First(c => c.Type == "imageUrl").Value;

        //    var user = _userService.GetUser(user => user.UserName == username, false);

        //    //if image is not set
        //    if (user.ImageUrl == null)
        //    {
        //        return NoContent();
        //    }

        //    var folderName = Path.Combine("Resources", "Images");
        //    var pathToSave = Path.Combine(Directory.GetCurrentDirectory(), folderName);
        //    string path = Path.Combine(pathToSave, user.ImageUrl);

        //    //if image does not exist
        //    if (!System.IO.File.Exists(path))
        //    {
        //        return NoContent();
        //    }

        //    Byte[] b;
        //    b = System.IO.File.ReadAllBytes(path);
        //    return File(b, "image/jpeg");
        //}

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

        #endregion
    }
}
