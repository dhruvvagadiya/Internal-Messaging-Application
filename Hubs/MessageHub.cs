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
        private readonly ChatAppContext _context;

        public MessageHub(ChatAppContext context)
        {
            _context = context;
        }

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
    }
}
