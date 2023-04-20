using ChatApp.Business.Helpers;
using ChatApp.Business.ServiceInterfaces;
using ChatApp.Models.Notification;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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

            var UserId = _userService.GetIdFromUsername(UserName);
            if(UserId == -1)
            {
                return BadRequest();
            }

            var list = _notificationService.GetAll(UserName, UserId);
            return Ok(list);
        }

        [HttpPost]
        public IActionResult AddNotification([FromBody] NotificationDTO notificationDTO)
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

        [HttpGet("view/{UserName}")]
        public IActionResult MakeSeen(string UserName)
        {
            var UserId = _userService.GetIdFromUsername(UserName);

            if (UserId == -1)
            {
                return BadRequest();
            }

            _notificationService.SeeNotifications(UserId);
            return Ok();

        }

        [HttpGet("clear/{UserName}")]
        public IActionResult ClearNotifications(string UserName)
        {
            var UserId = _userService.GetIdFromUsername(UserName);

            if (UserId == -1)
            {
                return BadRequest();
            }

            _notificationService.DeleteNotifications(UserId);
            return Ok();

        }

        [HttpGet("seen/{Id}")]
        public IActionResult MarkNotificationAsSeen(int Id)
        {
            _notificationService.MarkAsSeen(Id);
            return Ok();
        }

        #endregion

    }
}
