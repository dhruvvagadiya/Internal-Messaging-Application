using ChatApp.Context.EntityClasses;
using ChatApp.Context.EntityClasses.Group;
using ChatApp.Models.Group;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq.Expressions;

namespace ChatApp.Business.ServiceInterfaces
{
    public interface IGroupService
    {
        GroupDTO CreateGroup(int UserId, CreateGroup Obj);
        GroupDTO UpdateGroup(CreateGroup Obj, Group CurGroup);
        bool DeleteGroup(Group CurGroup);

        GroupMember AddUser(int UserId, Group CurGroup);
        bool RemoveUser(int UserId, Group CurGroup);
        IEnumerable<GroupDTO> GetAllGroups(int UserId, string UserName);
        IEnumerable<GroupMemberDTO> GetAllMembers(int GroupId);

        Group GetGroup(Expression<Func<Group, bool>> filter);
    }
}
