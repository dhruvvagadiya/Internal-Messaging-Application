using ChatApp.Business.Helpers;
using ChatApp.Context;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System;
using ChatApp.Business.ServiceInterfaces;
using ChatApp.Infrastructure.ServiceImplementation;
using ChatApp.Models.Auth;
using ChatApp.Models.GeneralMessages;

namespace ChatApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class GeneralController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IGeneralService _generalService;

        #region Constructor
        public GeneralController(IUserService userService, IGeneralService generalService)
        {
            _userService = userService;
            _generalService = generalService;
        }
        #endregion

        [HttpGet("areas")]
        public IActionResult GetRecentGroups()
        {
            try
            {
                string UserName = JwtHelper.GetUsernameFromRequest(Request);

                var User = _userService.GetUser(e => e.UserName == UserName);
                if (User == null)
                {
                    return BadRequest("Bad Request!");
                }

                return Ok(_generalService.GetAreasList());
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        [HttpPost("CreateGeneralPost")]
        public IActionResult CreateGeneralPost([FromBody] CreatePostModel generalPostModel)
        {
            try
            {
                //for chat app sidebar
                string username = JwtHelper.GetUsernameFromRequest(Request);

                if (username == null || username.Length == 0)
                {
                    return BadRequest("Invalid user!");
                }

                int userID = _userService.GetIdFromUsername(username);

                if (userID == -1)
                {
                    return BadRequest("Invalid user!");
                }

                var groupMessages = _generalService.createPost(userID, generalPostModel);

                return Ok(groupMessages);
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        [HttpGet("getAllMessages")]
        public IActionResult GetAllMessages([FromQuery] int? AreaId)
        {
            try
            {
                string UserName = JwtHelper.GetUsernameFromRequest(Request);

                var User = _userService.GetUser(e => e.UserName == UserName);
                if (User == null)
                {
                    return BadRequest("Bad Request!");
                }

                return Ok(_generalService.getAllMessages(AreaId));
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }
    }
}
