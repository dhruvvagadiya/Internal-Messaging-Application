using ChatApp.Context;
using ChatApp.Context.EntityClasses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Linq;

namespace ChatApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DesignationController : ControllerBase
    {
        private readonly ChatAppContext _context;

        public DesignationController(ChatAppContext context)
        {
            _context = context;
        }

        [AllowAnonymous]
        [HttpGet("getAll")]
        public IActionResult GetAll()
        {
            IQueryable<Designation> list = _context.Designations;
            if (_context.Profiles.Include("UserDesignation").FirstOrDefault(e => e.UserDesignation.Role.Equals("ceo")) != null){
                list = list.Where(e => !e.Role.ToLower().Equals("ceo"));
            }

            if (_context.Profiles.Include("UserDesignation").FirstOrDefault(e => e.UserDesignation.Role.Equals("cto")) != null)
            {
                list = list.Where(e => !e.Role.ToLower().Equals("cto"));
            }

            return Ok(list.ToList());
        }

        [Authorize(Policy = "CEO")]
        [HttpGet("all")]
        public IActionResult AllList()
        {
            var returnObj = _context.Designations.Where(e => !e.Role.ToLower().Equals("ceo")).ToList();
            return Ok(returnObj);
        }
    }
}
