using ChatApp.Business.Helpers;
using ChatApp.Context;
using ChatApp.Context.EntityClasses;
using ChatApp.Models.Chat;
using ChatApp.Models.Group;
using ChatApp.Models.GroupChat;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatApp.Hubs
{
    public class MessageHub : Hub
    {
        #region Fields
        private readonly ChatAppContext _context;

        #endregion

        #region Constructor
        public MessageHub(ChatAppContext context)
        {
            _context = context;
        }
        #endregion

        public override Task OnDisconnectedAsync(Exception? exception)
        {
            var conId = Context.ConnectionId;

            var con = _context.Connections.FirstOrDefault(e => e.SignalId == conId);

            if(con != null)
            {
                _context.Remove(con);
                _context.SaveChanges();
            }

            return Task.CompletedTask;
        }

        public async Task GetRecentChat(string from, string to)
        {
            var conId = Context.ConnectionId;

            //get userId's of both
            var senderProfile = _context.Profiles.FirstOrDefaultAsync(e => e.UserName == from).GetAwaiter().GetResult();
            var receiverProfile = _context.Profiles.FirstOrDefaultAsync(e => e.UserName == to).GetAwaiter().GetResult();

            int fromId = senderProfile.Id;
            int toId = receiverProfile.Id;


            //get all chats
            var allMsgs = _context.Chats.OrderBy(o => o.CreatedAt).Where(
                e => (e.MessageFrom == fromId && e.MessageTo == toId) || (e.MessageFrom == toId && e.MessageTo == fromId)
                );

            //count where receiver is current user and is not seen by user
            var unseenCnt = allMsgs.Count(e => e.MessageTo == toId && e.SeenByReceiver == 0);

            //sort chats by created date then select last chat from table
            var lastMsgObj = allMsgs.LastOrDefault();

            string lastMsg = "";
            DateTime? lastMsgTime = null;

            if (lastMsgObj != null)
            {
                lastMsg = lastMsgObj.Content;
                lastMsgTime = lastMsgObj.CreatedAt;
            }

            var userObj = new RecentChatModel();
            //userObj.User = ModelMapper.ConvertProfileToDTO(senderProfile);
            userObj.LastMessage = lastMsg;
            userObj.LastMsgTime = lastMsgTime;
            userObj.UnseenCount = unseenCnt;
            userObj.FirstName = senderProfile.FirstName;
            userObj.LastName = senderProfile.LastName;
            userObj.UserName = senderProfile.UserName;
            userObj.ImageUrl = senderProfile.ImageUrl;

            //receiver connection if online
            var rConnection = await _context.Connections.FirstOrDefaultAsync(e => e.ProfileId == toId);

            if(rConnection != null)
            {
                //send this model to receiver
                await Clients.Client(rConnection.SignalId).SendAsync("updateRecentChat", userObj);
            }

            //for sender unseencount = 0 rest will be same

            userObj.UnseenCount = 0;
            userObj.FirstName = receiverProfile.FirstName;
            userObj.LastName = receiverProfile.LastName;
            userObj.UserName = receiverProfile.UserName;
            userObj.ImageUrl = receiverProfile.ImageUrl;
            //userObj.User = ModelMapper.ConvertProfileToDTO(receiverProfile);

            await Clients.Client(conId).SendAsync("updateRecentChat", userObj);

        }

        public async Task sendMessage(ChatModel chat)
            {
            //get receiver
            var receiver = await _context.Profiles.FirstOrDefaultAsync(e => e.UserName == chat.MessageTo);

            if(receiver == null)
            {
                return;
            }

            //else check if receiver is online
            var rConnection = await _context.Connections.FirstOrDefaultAsync(e => e.ProfileId == receiver.Id);
            if(rConnection == null)
            {
                await Clients.Caller.SendAsync("receiveMessage", chat); ;
            }
            else   //send chat to receiver also
            {
                await Clients.Clients(rConnection.SignalId, Context.ConnectionId).SendAsync("receiveMessage", chat);
            }

        }

        public async Task sendGroupMessage(GroupChatModel chat)
        {

            IEnumerable<string> ConnectionIdList = getOnlineUsers(chat.GroupId);
            //3. send to all
            await Clients.Clients(ConnectionIdList).SendAsync("receiveMessage", chat);
        }

        public async Task updateGroup(GroupDTO group)
        {
            IEnumerable<string> ConnectionIdList = getOnlineUsers(group.Id);
            await Clients.Clients(ConnectionIdList).SendAsync("groupUpdated", group);
        }

        public async Task updateRecentGroup(GroupDTO group, GroupChatModel chat)
        {

            IEnumerable<string> ConnectionIdList = getOnlineUsers(chat.GroupId);

            var returnObj = new GroupRecentModel()
            {
                Group = group,
                FirstName = chat.FirstName,
                LastName = chat.LastName,
                ImageUrl = chat.ImageUrl,
                LastMsgTime = chat.CreatedAt,
                LastMessage = chat.FilePath != null ? "file" : chat.Content
            };

            await Clients.Clients(ConnectionIdList).SendAsync("updateRecentGroup", returnObj);

        }

        public async Task AddMembers(string[] usernames, GroupDTO group)
        {
            IList<string> ConnectionIds = new List<string>();

            foreach(string userName in usernames)
            {
                var userId = _context.Profiles.FirstOrDefault(e => e.UserName == userName).Id;
                var conn = _context.Connections.FirstOrDefault(e => e.ProfileId == userId);

                if(conn != null)
                {
                    ConnectionIds.Add(conn.SignalId);
                }
            }

            var returnObj = new GroupRecentModel()
            {
                Group = group,
                LastMessage="You were added!"
            };

            await Clients.Clients(ConnectionIds).SendAsync("updateRecentGroup", returnObj);
        }

        public async Task leaveFromGroup(int groupId, string username)
        {
            //get receiver
            var receiver = await _context.Profiles.FirstOrDefaultAsync(e => e.UserName == username);

            if (receiver == null)
            {
                return;
            }

            //else check if receiver is online
            var rConnection = await _context.Connections.FirstOrDefaultAsync(e => e.ProfileId == receiver.Id);
            if(rConnection != null)
            {
                await Clients.Client(rConnection.SignalId).SendAsync("leaveFromGroup", groupId);
            }
        }

        public async Task seenMessages(string fromUser, string ToUser)
        {
            int senderId = _context.Profiles.FirstOrDefaultAsync(e => e.UserName == fromUser).GetAwaiter().GetResult().Id;
            int receiverId = _context.Profiles.FirstOrDefaultAsync(e => e.UserName == ToUser).GetAwaiter().GetResult().Id;

            //get chats
            var chats = _context.Chats.Where(e => e.MessageFrom == senderId && e.MessageTo == receiverId);
            foreach (var tmp in chats)
            {
                tmp.SeenByReceiver = 1;
            }

            _context.UpdateRange(chats);
            await _context.SaveChangesAsync();

            //notify sender that receiver has seen msgs
            var sConnection = await _context.Connections.FirstOrDefaultAsync(e => e.ProfileId == senderId);

            if(sConnection != null)
            {
                await Clients.Client(sConnection.SignalId).SendAsync("seenMessage");
            }
        }

        #region Methods
        public string saveConnection(string username)
        {
            var tmp = _context.Profiles.FirstOrDefault(e => e.UserName.Equals(username));
            if (tmp == null)
            {
                return "";
            }

            //update old connection data
            Connection con = _context.Connections.FirstOrDefault(e => e.ProfileId == tmp.Id);
            if (con != null)
            {
                con.SignalId = Context.ConnectionId;
                con.TimeStamp = DateTime.Now;

                _context.Update(con);
            }
            else
            {
                var connection = new Connection();
                connection.TimeStamp = DateTime.Now;
                connection.SignalId = Context.ConnectionId;
                connection.ProfileId = tmp.Id;

                _context.Add(connection);
            }

            _context.SaveChanges();

            return Context.ConnectionId;
        }

        public void closeConnection(string username)
        {
            var tmp = _context.Profiles.FirstOrDefault(e => e.UserName.Equals(username));
            if (tmp == null)
            {
                return;
            }

            //update old connection data
            Connection con = _context.Connections.FirstOrDefault(e => e.ProfileId == tmp.Id);
            if (con != null)
            {
                _context.Remove(con);
                _context.SaveChanges();
            }
        }

        public IEnumerable<string> getOnlineUsers(int GroupId)
        {
            //1. get all users of the curgroup
            var members = _context.GroupMembers.Where(e => e.GroupId == GroupId).Select(e => e.UserId).ToList();

            IList<string> ConnectionIdList = new List<string>();

            //2. now check which users are online (get conn id's of them)
            foreach (var memberId in members)
            {
                var Connection = _context.Connections.FirstOrDefault(e => e.ProfileId == memberId);

                if (Connection != null)
                {
                    ConnectionIdList.Add(Connection.SignalId);
                }
            }

            return ConnectionIdList;
        }
        #endregion
    }
}
