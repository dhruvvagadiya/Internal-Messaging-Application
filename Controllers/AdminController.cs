using ChatApp.Business.ServiceInterfaces;
using ChatApp.Models.Auth;
using ChatApp.Models.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChatApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;
        private readonly IUserService _userService;

        public AdminController(IAdminService adminService, IUserService userService)
        {
            _adminService = adminService;
            _userService = userService;
        }

        [HttpGet("all")]
        public IActionResult GetEmployees()
        {
            var list = _adminService.GetAll();
            return Ok(list);
        }

        [HttpPost("update")]
        [Authorize(Policy = "admin")]
        public IActionResult UpdateEmployee([FromBody] AdminProfileDTO obj)
        {

            var User = _userService.GetUser(e => e.UserName.Equals(obj.UserName));

            if(User == null)
            {
                return NotFound();
            }

            var returnObj = _adminService.UpdateEmployeeDetails(obj, User);

            return Ok(returnObj);
        }

        [Authorize(Policy = "admin")]
        [HttpDelete("delete")]
        public IActionResult DeleteEmployee([FromQuery] string UserName)
        {
            if (_adminService.DeleteEmployee(UserName))
            {
                return Ok();
            }
            else
            {
                return BadRequest();
            }
        }
    }
}
