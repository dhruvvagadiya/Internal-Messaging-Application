using ChatApp.Business.Helpers;
using ChatApp.Business.ServiceInterfaces;
using ChatApp.Models.GroupChat;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System;

namespace ChatApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    //[AllowAnonymous]
    public class GroupChatController : ControllerBase
    {
        #region Fields
        private readonly IUserService _userService;
        private readonly IGroupChatService _groupChatService;
        #endregion

        #region Constructor
        public GroupChatController(IUserService userService, IGroupChatService groupChatService)
        {
            _userService = userService;
            _groupChatService = groupChatService;
        }
        #endregion

        #region Endpoints

        [HttpGet("recent")]
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

                var RecentGroupList = _groupChatService.GetRecentList(User.Id);

                return Ok(RecentGroupList);
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        [HttpPost]
        [Route("{GroupId}")]
        public IActionResult SendMessage(int GroupId, [FromForm] GroupChatSendModel SendChat)
        {

            try
            {
                if (GroupId != SendChat.GroupId)
                {
                    return BadRequest();
                }

                if (!_groupChatService.Exists(GroupId))
                {
                    return BadRequest("Group does not exists!");
                }

                //if both content and file are not provided
                if (SendChat.Content == null && SendChat.File == null) { return BadRequest("Bad Request !"); }

                //check if user is a member of the group
                var Sender = _userService.GetUser(e => e.UserName == SendChat.Sender);

                if (Sender == null) { return BadRequest("Bad Request !"); }

                if (!_groupChatService.IsaMemberOf(Sender.Id, GroupId))
                {
                    return BadRequest("User is not a part of the group");
                }

                //send message
                if (SendChat.Type == "text" && SendChat.Content != null)
                {
                    var sentMessage = _groupChatService.SendTextMessage(Sender, SendChat.GroupId, SendChat.Content, SendChat.RepliedTo);
                    return Ok(sentMessage);
                }

                else if (SendChat.Type == "file" && SendChat.File != null)
                {
                    var sentMessage = _groupChatService.SendFileMessage(Sender, SendChat);
                    return Ok(sentMessage);
                }

                return BadRequest("Bad Request !");
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        [HttpGet("{GroupId}")]
        public IActionResult GetChatHistory(int GroupId)
        {
            try
            {
                if (!_groupChatService.Exists(GroupId))
                {
                    return BadRequest("Group does not exists!");
                }

                var chatList = _groupChatService.GetChatList(GroupId);

                return Ok(chatList);
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }


        [HttpGet("data/{UserName}")]
        public IActionResult GetGroupChatData(string UserName)
        {
            try
            {
                int UserId = _userService.GetIdFromUsername(UserName);

                if (UserId == -1)
                {
                    return BadRequest();
                }

                var List = _groupChatService.GetGroupChatData(UserId);

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
