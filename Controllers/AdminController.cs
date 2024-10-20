using ChatApp.Business.Helpers;
using ChatApp.Business.ServiceInterfaces;
using ChatApp.Infrastructure.ServiceImplementation;
using ChatApp.Models.Auth;
using ChatApp.Models.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System;
using System.Threading.Tasks;

namespace ChatApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;
        private readonly IUserService _userService;
        private readonly PasswordHelper _passwordHelp;

        public AdminController(IAdminService adminService, IUserService userService)
        {
            _adminService = adminService;
            _userService = userService;
            _passwordHelp = new PasswordHelper();
        }

        [HttpGet]
        [Authorize]
        public IActionResult GetEmployees()
        {
            try
            {
                var list = _adminService.GetAll();
                return Ok(list);
            }
            catch (Exception)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        [HttpPost]
        [Authorize(Policy = "Admin")]
        public IActionResult CreateEmployee([FromBody] RegisterModel registerModel)
        {
            try
            {
                //check first  ceo -> can create all   cto -> all except ceo,cto
                var Designation = JwtHelper.GetRoleFromRequest(Request);
                if (Designation.Equals("CTO"))
                {
                    if(registerModel.DesignationId == DesignationType.CEO || registerModel.DesignationId == DesignationType.CTO) { 
                        return Unauthorized(); 
                    }
                }

                var salt = _passwordHelp.GenerateSalt();

                //hash password
                var hashedPass = _passwordHelp.GetHash(registerModel.Password, salt);

                //change password with new hashed password
                registerModel.Password = hashedPass;

                var user = _adminService.AddUser(registerModel, salt);
                if (user != null)
                {
                    return Ok(user);
                }

                return BadRequest(new { Message = "User Already Exists. Please use different email and UserName." });
            }
            catch (Exception)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        [HttpPut]
        [Authorize(Policy = "admin")]
        public async Task<IActionResult> UpdateEmployee([FromBody] AdminProfileDTO obj)
        {
            try
            {

                //check first  ceo -> can create all   cto -> all except ceo,cto
                var Designation = JwtHelper.GetRoleFromRequest(Request);
                if (Designation.Equals("CTO"))
                {
                    if (obj.DesignationId == DesignationType.CEO || obj.DesignationId == DesignationType.CTO)
                    {
                        return Unauthorized();
                    }
                }

                var User = _userService.GetUser(e => e.UserName.Equals(obj.UserName));

                if (User == null)
                {
                    return NotFound();
                }

                var returnObj = await _adminService.UpdateEmployeeDetails(obj, User);

                return Ok(returnObj);
            }
            catch (Exception)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        [Authorize(Policy = "admin")]
        [HttpDelete]
        public async Task<IActionResult> DeleteEmployee([FromQuery] string UserName)
        {
            try
            {
                if (await _adminService.DeleteEmployee(UserName))
                {
                    return Ok();
                }
                else
                {
                    return BadRequest();
                }
            }
            catch (Exception)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

        }
    }
}
