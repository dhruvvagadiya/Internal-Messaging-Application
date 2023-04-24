using ChatApp.Context.EntityClasses;
using ChatApp.Models.Users;
using System.Collections.Generic;
using System.Linq.Expressions;
using System;

namespace ChatApp.Business.ServiceInterfaces
{
    public interface IUserService
    {
        Profile UpdateUser(UpdateModel updateModel, string username);

        Profile GetUser(Expression<Func<Profile, bool>> filter, bool tracked = true);

        IEnumerable<ProfileDTO> GetAll(string name, string username);

        IEnumerable<ProfileDTO> GetAll();

        string UpdateProfileStatus(string Status, Profile User);

        int GetIdFromUsername(string username);
    }
}
