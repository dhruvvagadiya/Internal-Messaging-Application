using ChatApp.Business.Helpers;
using ChatApp.Business.ServiceInterfaces;
using ChatApp.Models.Notification;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System;

namespace ChatApp.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        #region Fields
        private readonly INotificationService _notificationService;
        private readonly IUserService _userService;

        #endregion

        #region Constructor
        public NotificationController(INotificationService notificationService, IUserService userService)
        {
            _notificationService = notificationService;
            _userService = userService;
        }
        #endregion

        #region End points 

        [HttpGet("{UserName}")]
        public IActionResult GetAllNotification(string UserName)
        {
            try
            {
                var UserId = _userService.GetIdFromUsername(UserName);
                if (UserId == -1)
                {
                    return BadRequest();
                }

                var list = _notificationService.GetAll(UserName, UserId);
                return Ok(list);
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        [HttpPost]
        public IActionResult AddNotification([FromBody] NotificationDTO notificationDTO)
        {
            try
            {
                var UserName = JwtHelper.GetUsernameFromRequest(Request);
                var UserId = _userService.GetIdFromUsername(UserName);

                if (UserId == -1)
                {
                    return BadRequest();
                }

                var obj = _notificationService.AddNotification(notificationDTO, UserId);

                return Ok(obj);
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        [HttpGet("view/{UserName}")]
        public IActionResult MakeSeen(string UserName)
        {
            try
            {
                var UserId = _userService.GetIdFromUsername(UserName);

                if (UserId == -1)
                {
                    return BadRequest();
                }

                _notificationService.SeeNotifications(UserId);
                return Ok();
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        [HttpGet("clear/{UserName}")]
        public IActionResult ClearNotifications(string UserName)
        {
            try
            {
                var UserId = _userService.GetIdFromUsername(UserName);

                if (UserId == -1)
                {
                    return BadRequest();
                }

                _notificationService.DeleteNotifications(UserId);
                return Ok();
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        [HttpGet("seen/{Id}")]
        public IActionResult MarkNotificationAsSeen(int Id)
        {
            try
            {
                _notificationService.MarkAsSeen(Id);
                return Ok();
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        #endregion

    }
}
