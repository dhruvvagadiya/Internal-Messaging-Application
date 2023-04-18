using ChatApp.Context.EntityClasses;
using ChatApp.Models.GroupChat;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace ChatApp.Business.ServiceInterfaces
{
    public interface IGroupChatService
    {
        GroupChatModel SendTextMessage(Profile Sender, int groupId, string content, int? RepliedTo);
        GroupChatModel SendFileMessage(Profile Sender, GroupChatSendModel SendChat);

        IEnumerable<GroupChatModel> GetChatList (int GroupId);
        IEnumerable<GroupRecentModel> GetRecentList (int UserId);

        bool IsaMemberOf(int UserId, int GroupId);

        bool Exists(int GroupId);
    }
}
