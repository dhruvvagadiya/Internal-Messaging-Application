using ChatApp.Models.Chat;
using System.Collections.Generic;

namespace ChatApp.Business.ServiceInterfaces
{
    public interface IChatService
    {
        IEnumerable<ChatModel> GetChatList (int userFrom, int userTo, string fromUserName, string toUserName);

        ChatModel SendTextMessage(string fromUser, string toUser, string content);

        IEnumerable<RecentChatModel> GetRecentList(int userID);
    }
}
