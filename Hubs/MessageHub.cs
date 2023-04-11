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

                //make all chats read in db
                int userFrom = _context.Profiles.FirstOrDefault(e => e.UserName == chat.MessageFrom).Id;
                int userTo = _context.Profiles.FirstOrDefault(e => e.UserName == chat.MessageTo).Id;

                var chats = _context.Chats.Where(u => (u.MessageFrom == userFrom && u.MessageTo == userTo) || (u.MessageFrom == userTo && u.MessageTo == userFrom)).ToList();


                //make all chats seen when fetched
                foreach (var tmp in chats)
                {
                    if (tmp.MessageFrom == userFrom)
                    {
                        tmp.SeenByReceiver = 1;
                    }
                }

                _context.UpdateRange(chats);
                _context.SaveChanges();

                chat.SeenByReceiver = 1;
                await Clients.Clients(rConnection.SignalId, Context.ConnectionId).SendAsync("receiveMessage", chat);
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
