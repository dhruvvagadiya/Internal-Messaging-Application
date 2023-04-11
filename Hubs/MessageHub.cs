using ChatApp.Business.Helpers;
using ChatApp.Context;
using ChatApp.Context.EntityClasses;
using ChatApp.Models.Chat;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
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
            userObj.User = ModelMapper.ConvertProfileToDTO(senderProfile);
            userObj.LastMessage = lastMsg;
            userObj.LastMsgTime = lastMsgTime;
            userObj.UnseenCount = unseenCnt;

            //receiver connection if online
            var rConnection = await _context.Connections.FirstOrDefaultAsync(e => e.ProfileId == toId);

            if(rConnection != null)
            {
                //send this model to receiver
                await Clients.Client(rConnection.SignalId).SendAsync("updateRecentChat", userObj);
            }

            //for sender unseencount = 0 rest will be same

            userObj.UnseenCount = 0;
            userObj.User = ModelMapper.ConvertProfileToDTO(receiverProfile);

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

        public async Task seenMessages(string fromUser, string ToUser)
        {
            int senderId = _context.Profiles.FirstOrDefaultAsync(e => e.UserName == fromUser).GetAwaiter().GetResult().Id;
            int receiverId = _context.Profiles.FirstOrDefaultAsync(e => e.UserName == ToUser).GetAwaiter().GetResult().Id;

            //get chats
            var chats = _context.Chats.Where(e => e.MessageFrom == senderId && e.MessageTo == receiverId);
            foreach(var tmp in chats)
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
        #endregion
    }
}
