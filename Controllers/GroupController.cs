using ChatApp.Business.Helpers;
using ChatApp.Business.ServiceInterfaces;
using ChatApp.Hubs;
using ChatApp.Models.Group;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Generic;

namespace ChatApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    //[AllowAnonymous]
    public class GroupController : ControllerBase
    {
        #region Fields
        private readonly IUserService _userService;
        private readonly IGroupService _groupService;
        #endregion

        #region Constructor
        public GroupController(IUserService userService, IGroupService groupService, IHubContext<MessageHub> hub)
        {
            _userService = userService;
            _groupService = groupService;
        }
        #endregion

        #region End points 

        [HttpPost("Create")]
        public IActionResult CreateGroup([FromForm] CreateGroup Obj)
        {
            if (Obj.GroupName.Length == 0)
            {
                return BadRequest("Cannot create a group without a name");
            }

            var UserId = _userService.GetIdFromUsername(Obj.UserName);

            if (UserId == -1)
            {
                return BadRequest("User does not exist");
            }

            var GroupDto = _groupService.CreateGroup(UserId, Obj);

            return Ok(GroupDto);
        }

        [HttpPut("Update")]
        public IActionResult UpdateGroup([FromForm] CreateGroup Obj)
        {
            if (Obj.GroupId == 0) return BadRequest("Invalid Group Id");

            //only creator can update group details
            var UserId = _userService.GetIdFromUsername(Obj.UserName);

            var CurGroup = _groupService.GetGroup(e => e.Id == Obj.GroupId);

            var CurUserName = JwtHelper.GetUsernameFromRequest(Request);
            var CurUserId = _userService.GetIdFromUsername(CurUserName);

            if (CurGroup.CreatedBy != CurUserId)
            {
                return Unauthorized();
            }

            var GroupDto= _groupService.UpdateGroup(Obj, CurGroup);

            return Ok(GroupDto);
        }

        [HttpPost("Add")]
        public IActionResult AddUser([FromBody] AddUser AddUser)
        {
            var CurGroup = _groupService.GetGroup(e => e.Id == AddUser.GroupId);
            var UserId = _userService.GetIdFromUsername(AddUser.UserName);

            if(UserId == -1 || CurGroup == null)
            {
                return NotFound();
            }

            var CurUserName = JwtHelper.GetUsernameFromRequest(Request);
            var CurUserId = _userService.GetIdFromUsername(CurUserName);

            //only creator can add/remove user
            if (CurGroup.CreatedBy != CurUserId)
            {
                return Unauthorized();
            }

            var obj = _groupService.AddUser(UserId, CurGroup);
            if (obj != null)
            {
                var returnObj = new GroupMemberDTO()
                {
                    FirstName = obj.User.FirstName,
                    LastName = obj.User.LastName,
                    UserName = obj.User.UserName,
                    ImageUrl = obj.User.ImageUrl,
                    AddedAt = obj.AddedAt
                };

                return Ok(returnObj);
            }

            return BadRequest("Can not add user to this group");
        }

        [HttpPost("Add/{GroupId}")]
        public IActionResult AddUsers(int GroupId, [FromBody] string[] userNames)
        {
            var CurGroup = _groupService.GetGroup(e => e.Id == GroupId);
            if(CurGroup == null)
            {
                return NotFound();
            }

            var CurUserName = JwtHelper.GetUsernameFromRequest(Request);
            var CurUserId = _userService.GetIdFromUsername(CurUserName);

            //only creator can add/remove user
            if (CurGroup.CreatedBy != CurUserId)
            {
                return Unauthorized();
            }

            IList<GroupMemberDTO> returnList = new List<GroupMemberDTO>();

            foreach (var userName in userNames)
            {
                var id = _userService.GetIdFromUsername(userName);
                var obj = _groupService.AddUser(id, CurGroup);

                var returnObj = new GroupMemberDTO()
                {
                    FirstName = obj.User.FirstName,
                    LastName = obj.User.LastName,
                    UserName = obj.User.UserName,
                    ImageUrl = obj.User.ImageUrl,
                    AddedAt = obj.AddedAt
                };

                returnList.Add(returnObj);
            }

            return Ok(returnList);
        }

        [HttpPost("Remove")]
        public IActionResult RemoveUser([FromBody] AddUser RemoveUser)
        {
            var CurGroup = _groupService.GetGroup(e => e.Id == RemoveUser.GroupId);
            var UserId = _userService.GetIdFromUsername(RemoveUser.UserName);

            if (UserId == -1 || CurGroup == null)
            {
                return NotFound();
            }

            var CurUserName = JwtHelper.GetUsernameFromRequest(Request);
            var CurUserId = _userService.GetIdFromUsername(CurUserName);

            //only creator or user itself have access
            if (CurGroup.CreatedBy != CurUserId && UserId != CurUserId)
            {
                return Unauthorized();
            }

            if (_groupService.RemoveUser(UserId, CurGroup))
            {
                return Ok();
            }

            return BadRequest("Can not remove user from this group!");

        }

        //get all group to which user belongs
        [HttpGet("{UserName}")]
        public IActionResult GetAll(string UserName)
        {
            if(UserName == null || UserName.Length == 0)
            {
                return BadRequest();
            }

            var UserId = _userService.GetIdFromUsername(UserName);

            if(UserId == -1)
            {
                return BadRequest();
            }

            var groupList =_groupService.GetAllGroups(UserId, UserName);

            return Ok(groupList);
        }

        //get all members of a particular group
        [HttpGet("all/{Id}")]
        public IActionResult GetAllMembers(int Id)
        {
            if(Id == 0) {
                return BadRequest("Group does not exists");
            }

            var Members = _groupService.GetAllMembers(Id);
            return Ok(Members);
        }

        [HttpDelete("{Id}")]
        public IActionResult DeleteGroup (int Id)
        {
            if (Id == 0) return BadRequest();

            var UserName = JwtHelper.GetUsernameFromRequest(Request);
            var UserId = _userService.GetIdFromUsername(UserName);

            var CurGroup = _groupService.GetGroup(e => e.Id == Id);
            if (UserId == -1 || CurGroup == null)
            {
                return NotFound();
            }

            var CurUserName = JwtHelper.GetUsernameFromRequest(Request);
            var CurUserId = _userService.GetIdFromUsername(CurUserName);

            //only creator can add/remove user
            if (CurGroup.CreatedBy != CurUserId)
            {
                return Unauthorized();
            }

            if (_groupService.DeleteGroup(CurGroup))
            {
                return Ok();
            }

            return BadRequest();
        }

        #endregion

    }
}
