using ChatApp.Business.Helpers;
using ChatApp.Business.ServiceInterfaces;
using ChatApp.Infrastructure.ServiceImplementation;
using ChatApp.Models.Chat;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace ChatApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IChatService _chatService;
        public ChatController(IUserService userService, IChatService chatService)
        {
            _userService = userService;
            _chatService = chatService;
        }

        [HttpGet]
        [Route("{toUser}")]
        public IActionResult GetHistoryWithUser (string toUser)
        {
            ///returns chat with user provided in url

            string fromUser = JwtHelper.GetUsernameFromRequest(Request);
       
            if(fromUser == null)
            {
                return BadRequest();
            }

            int fromId = _userService.GetIdFromUsername(fromUser);
            int toId = _userService.GetIdFromUsername(toUser);

            if(fromId == -1 || toId == -1)
            {
                return BadRequest();
            }

            var chatList = _chatService.GetChatList(fromId, toId, fromUser, toUser);

            return Ok(chatList);

        }

        [HttpGet]
        [Route("recent")]
        public IActionResult GetRecentChats()
        {
            //for chat app sidebar
            string username = JwtHelper.GetUsernameFromRequest(Request);

            if(username == null || username.Length == 0)
            {
                return BadRequest("Invalid user!");
            }

            int userID = _userService.GetIdFromUsername(username);

            if(userID == -1)
            {
                return BadRequest("Invalid user!");
            }

            var recentList = _chatService.GetRecentList(userID);

            return Ok(recentList);
        }

        [HttpPost]
        [Route("{toUser}")]
        public IActionResult SendMessage(string toUser, [FromBody] ChatSendModel SendChat)
        {
            //add message to DB

            string fromUser = JwtHelper.GetUsernameFromRequest(Request);
            //string fromUser = "dhruvPatel";

            //checking 
            if (fromUser == null) { return BadRequest();  }

            if(_userService.GetUser(e => e.UserName == fromUser) == null || _userService.GetUser(e => e.UserName == toUser) == null)
            {
                return BadRequest();
            }

            if(SendChat.Sender != fromUser || SendChat.Receiver != toUser) { return BadRequest(); } 

            if(SendChat.Type == "text")
            {
                var sentMessage = _chatService.SendTextMessage(fromUser, toUser, SendChat.Content);
                return Ok(sentMessage);
            }

            return BadRequest("Bad Request !");
        }
    }
}
