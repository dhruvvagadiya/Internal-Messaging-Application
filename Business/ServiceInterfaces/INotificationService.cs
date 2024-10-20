using ChatApp.Context.EntityClasses;
using ChatApp.Models.Notification;
using System.Collections.Generic;

namespace ChatApp.Business.ServiceInterfaces
{
    public interface INotificationService
    {
        IEnumerable<NotificationDTO> GetAll(string UserName, int UserId);

        NotificationDTO AddNotification (NotificationDTO notificationDTO, int UserId);

        void SeeNotifications(int UserID);

        void DeleteNotifications(int UserID);

        void MarkAsSeen(Notification notification);

        Notification GetNotification(int id);
    }
}
