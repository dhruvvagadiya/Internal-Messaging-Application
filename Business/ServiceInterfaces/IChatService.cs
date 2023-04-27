using ChatApp.Models.Chat;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ChatApp.Business.ServiceInterfaces
{
    public interface IChatService
    {
        IEnumerable<ChatModel> GetChatList (int userFrom, int userTo, string fromUserName, string toUserName);

        Task<ChatModel> SendTextMessage(string fromUser, string toUser, string content, int? RepliedTo);

        IEnumerable<RecentChatModel> GetRecentList(int userID);

        Task<ChatModel> SendFileMessage(string fromUser, string toUser, ChatSendModel SendChat);

        IEnumerable<ChatDataModel> GetChatData(int UserId);
    }
}
