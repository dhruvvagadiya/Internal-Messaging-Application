using ChatApp.Business.Helpers;
using ChatApp.Business.ServiceInterfaces;
using ChatApp.Context;
using ChatApp.Context.EntityClasses;
using ChatApp.Models.Notification;
using System;
using System.Collections.Generic;
using System.Linq;

namespace ChatApp.Infrastructure.ServiceImplementation
{
    public class NotificationService : INotificationService
    {
        #region Fields
        private readonly ChatAppContext _context;
        #endregion

        #region Constructor
        public NotificationService(ChatAppContext context) {
            _context = context;
        }
        #endregion

        #region Methods
        public IEnumerable<NotificationDTO> GetAll(string UserName, int UserId)
        {
            var NotList = _context.Notifications.Where(e => e.UserId == UserId);

            IList<NotificationDTO> returnObj = new List<NotificationDTO>();

            foreach(var notification in  NotList)
            {
                var tempDTO = ModelMapper.NotificationToDTO(notification);
                returnObj.Add(tempDTO);
            }

            returnObj = returnObj.OrderByDescending(e => e.CreatedAt).ToList();

            return returnObj;
        }

        public NotificationDTO AddNotification(NotificationDTO notificationDTO, int UserId)
        {
            var notification = new Notification()
            {
                UserId = UserId,
                Content = notificationDTO.Content,
                Type = notificationDTO.Type,
                CreatedAt = DateTime.Now,
                IsSeen = 0
            };

            _context.Notifications.Add(notification);
            _context.SaveChanges();

            notificationDTO.Id = notification.Id;
            notificationDTO.CreatedAt = notification.CreatedAt;

            return notificationDTO;
        }

        public void SeeNotifications(int UserID)
        {
            var notList = _context.Notifications.Where(e => e.UserId == UserID);
            foreach(var notification in notList)
            {
                notification.IsSeen = 1;
            }

            _context.UpdateRange(notList);
            _context.SaveChanges();
        }

        public void DeleteNotifications(int UserID)
        {
            var notList = _context.Notifications.Where(e => e.UserId == UserID);
            _context.RemoveRange(notList);
            _context.SaveChanges();
        }

        public void MarkAsSeen(int NotificationId)
        {
            var notification = _context.Notifications.FirstOrDefault(e => e.Id == NotificationId);
            if(notification != null)
            {
                notification.IsSeen = 1;
                _context.SaveChanges();
            }
        }
        #endregion

        #region Private Methods

        #endregion
    }
}
