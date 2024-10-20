using ChatApp.Business.Helpers;
using ChatApp.Business.ServiceInterfaces;
using ChatApp.Models.Chat;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Net;
using System.Threading.Tasks;

namespace ChatApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ChatController : ControllerBase
    {
        #region Fields
        private readonly IUserService _userService;
        private readonly IChatService _chatService;

        #endregion

        #region Constructor
        public ChatController(IUserService userService, IChatService chatService)
        {
            _userService = userService;
            _chatService = chatService;
        }
        #endregion

        #region EndPoints

        [HttpGet]
        public IActionResult GetHistoryWithUser ([FromQuery] string toUser)
        {
            try
            {
                ///returns chat with user provided in url
                string fromUser = JwtHelper.GetUsernameFromRequest(Request);

                if (fromUser == null)
                {
                    return BadRequest();
                }

                int fromId = _userService.GetIdFromUsername(fromUser);
                int toId = _userService.GetIdFromUsername(toUser);

                if (fromId == -1 || toId == -1)
                {
                    return BadRequest();
                }

                var chatList = _chatService.GetChatList(fromId, toId, fromUser, toUser);

                return Ok(chatList);
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        [HttpGet]
        [Route("recent")]
        public IActionResult GetRecentChats()
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

                var recentList = _chatService.GetRecentList(userID);

                return Ok(recentList);
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        //add message to DB
        [HttpPost()]
        public async Task<IActionResult> SendMessage([FromForm] ChatSendModel SendChat)
        {
            try
            {
                string fromUser = JwtHelper.GetUsernameFromRequest(Request);

                //checking 
                if (fromUser == null) { return BadRequest(); }

                if (_userService.GetUser(e => e.UserName == fromUser) == null || _userService.GetUser(e => e.UserName == SendChat.Receiver) == null)
                {
                    return BadRequest();
                } 

                //if both content and file are not provided
                if (SendChat.Content == null && SendChat.File == null) { return BadRequest(); }

                if (SendChat.Type == "text" && SendChat.Content != null)
                {
                    var sentMessage = await _chatService.SendTextMessage(fromUser, SendChat.Receiver, SendChat.Content, SendChat.RepliedTo);
                    return Ok(sentMessage);
                }
                else if (SendChat.Type == "file" && SendChat.File != null)
                {
                    var sentMessage = await _chatService.SendFileMessage(fromUser, SendChat.Receiver, SendChat);
                    return Ok();
                }

                return BadRequest("Bad Request !");
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        [HttpGet("data")]
        public IActionResult GetChatData()
        {
            try
            {
                string UserName = JwtHelper.GetUsernameFromRequest(Request);

                if (UserName == null) return BadRequest();

                var UserId = _userService.GetIdFromUsername(UserName);

                if (UserId == -1) return BadRequest();

                var List = _chatService.GetChatData(UserId);

                return Ok(List);
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        #endregion
    }
}
