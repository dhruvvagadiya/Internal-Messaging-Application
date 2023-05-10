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
        [Route("{toUser}")]
        public IActionResult GetHistoryWithUser (string toUser)
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
        [HttpPost]
        [Route("{toUser}")]
        public async Task<IActionResult> SendMessage(string toUser, [FromForm] ChatSendModel SendChat)
        {
            try
            {
                string fromUser = JwtHelper.GetUsernameFromRequest(Request);
                //string fromUser = "dhruvPatel";

                //checking 
                if (fromUser == null) { return BadRequest(); }

                if (_userService.GetUser(e => e.UserName == fromUser) == null || _userService.GetUser(e => e.UserName == toUser) == null)
                {
                    return BadRequest();
                }

                //validate both sender and receiver
                if (SendChat.Sender != fromUser || SendChat.Receiver != toUser) { return BadRequest(); }

                //if both content and file are not provided
                if (SendChat.Content == null && SendChat.File == null) { return BadRequest(); }

                if (SendChat.Type == "text" && SendChat.Content != null)
                {
                    var sentMessage = await _chatService.SendTextMessage(fromUser, toUser, SendChat.Content, SendChat.RepliedTo);
                    return Ok(sentMessage);
                }
                else if (SendChat.Type == "file" && SendChat.File != null)
                {
                    var sentMessage = await _chatService.SendFileMessage(fromUser, toUser, SendChat);
                    return Ok();
                }

                return BadRequest("Bad Request !");
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        [HttpGet("data/{UserName}")]
        public IActionResult GetChatData(string UserName)
        {
            try
            {
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
