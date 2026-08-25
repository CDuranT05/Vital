using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Vital.Domain.Entities;
using Vital.Domain.Enums;
using Vital.Infrastructure.Identity;
using Vital.Infrastructure.Persistence;

public static class SeedData
{
    public static async Task SeedBranchesAndTechniciansAsync(
        VitalDbContext db,
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager)
    {
        if (await db.Branches.AnyAsync()) return;

        // Asegurar roles
        foreach (var role in new[] { "Technician", "Inspector", "Citizen" })
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole(role));
        }

        // Sucursales
        var branches = new[]
        {
            new Branch
            {
                Id = Guid.NewGuid(), Name = "Sucursal El Espino",
                City = "El Espino", Address = "Av. Principal, El Espino, Barinas",
                Phone = "0273-4210001", IsActive = true
            },
            new Branch
            {
                Id = Guid.NewGuid(), Name = "Sucursal Valle de la Pascua",
                City = "Valle de la Pascua", Address = "Calle Comercio, Valle de la Pascua, Guárico",
                Phone = "0235-3310002", IsActive = true
            },
            new Branch
            {
                Id = Guid.NewGuid(), Name = "Sucursal San Juan de los Morros",
                City = "San Juan de los Morros", Address = "Av. Bicentenario, San Juan de los Morros, Guárico",
                Phone = "0246-4310003", IsActive = true
            }
        };
        db.Branches.AddRange(branches);
        await db.SaveChangesAsync();

        // Técnicos por sucursal
        var techData = new[]
        {
            // El Espino
            new { Card = "T-EE0001", First = "Carlos",    Last = "Mendoza",  Branch = branches[0] },
            new { Card = "T-EE0002", First = "Luisa",     Last = "Ferreira", Branch = branches[0] },
            new { Card = "T-EE0003", First = "Jorge",     Last = "Peñaloza", Branch = branches[0] },
            new { Card = "T-EE0004", First = "Andreina",  Last = "Ramos",    Branch = branches[0] },
            // Valle de la Pascua
            new { Card = "T-VP0001", First = "Miguel",    Last = "Torres",   Branch = branches[1] },
            new { Card = "T-VP0002", First = "Sofía",     Last = "Blanco",   Branch = branches[1] },
            new { Card = "T-VP0003", First = "Ramón",     Last = "Castillo", Branch = branches[1] },
            new { Card = "T-VP0004", First = "Valentina", Last = "Díaz",     Branch = branches[1] },
            // San Juan de los Morros
            new { Card = "T-SJ0001", First = "Héctor",    Last = "Guzmán",   Branch = branches[2] },
            new { Card = "T-SJ0002", First = "Patricia",  Last = "Moreno",   Branch = branches[2] },
            new { Card = "T-SJ0003", First = "Alexis",    Last = "Salinas",  Branch = branches[2] },
            new { Card = "T-SJ0004", First = "Carmen",    Last = "Núñez",    Branch = branches[2] },
        };

        // Turnos: mañana 06-14, tarde 14-22, noche 22-06, apoyo 08-20
        var shiftTemplates = new[]
        {
            new { Name = "Turno Mañana",  Start = 6,  End = 14 },
            new { Name = "Turno Tarde",   Start = 14, End = 22 },
            new { Name = "Turno Noche",   Start = 22, End = 6  },
            new { Name = "Turno Apoyo",   Start = 8,  End = 20 },
        };

        foreach (var t in techData)
        {
            var user = await userManager.FindByNameAsync(t.Card);
            if (user is null)
            {
                user = new ApplicationUser
                {
                    UserName = t.Card,
                    IdentityCard = t.Card,
                    FirstName = t.First,
                    LastName = t.Last,
                    Email = $"{t.Card.Replace("-", "").ToLower()}@vital.local",
                    Role = UserRole.Technician
                };
                await userManager.CreateAsync(user, t.Card);
                await userManager.AddToRoleAsync(user, "Technician");
            }

            var idx = Array.IndexOf(techData, t) % 4;
            var tmpl = shiftTemplates[idx];

            db.Shifts.Add(new Shift
            {
                Id = Guid.NewGuid(),
                TechnicianId = user.Id,
                BranchId = t.Branch.Id,
                ShiftName = tmpl.Name,
                StartHour = tmpl.Start,
                EndHour = tmpl.End,
                IsActive = true
            });
        }

        await db.SaveChangesAsync();
    }

    public static async Task SeedInspectorsAsync(
        VitalDbContext db,
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager)
    {
        foreach (var role in new[] { "Technician", "Inspector", "Citizen" })
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole(role));
        }

        var branches = await db.Branches.OrderBy(b => b.Name).ToListAsync();
        if (branches.Count < 3) return;

        // One inspector per branch, ordered same as seed: El Espino, San Juan, Valle
        var inspectors = new[]
        {
            new { Card = "I-001", First = "María",    Last = "González", Branch = branches.First(b => b.City == "El Espino") },
            new { Card = "I-002", First = "Rafael",   Last = "Morales",  Branch = branches.First(b => b.City == "Valle de la Pascua") },
            new { Card = "I-003", First = "Gabriela", Last = "Vargas",   Branch = branches.First(b => b.City == "San Juan de los Morros") },
        };

        foreach (var i in inspectors)
        {
            var existing = await userManager.FindByNameAsync(i.Card);

            if (existing is not null)
            {
                // Patch BranchId if missing
                if (existing.BranchId is null)
                {
                    existing.BranchId = i.Branch.Id;
                    await userManager.UpdateAsync(existing);
                }
                // Ensure password is correct (reset in case seed ran with bad password before)
                var token = await userManager.GeneratePasswordResetTokenAsync(existing);
                await userManager.ResetPasswordAsync(existing, token, "Inspector123!");
                if (!await userManager.IsInRoleAsync(existing, "Inspector"))
                    await userManager.AddToRoleAsync(existing, "Inspector");
                continue;
            }

            var user = new ApplicationUser
            {
                UserName = i.Card,
                IdentityCard = i.Card,
                FirstName = i.First,
                LastName = i.Last,
                Email = $"{i.Card.Replace("-", "").ToLower()}@vital.local",
                Role = UserRole.Inspector,
                BranchId = i.Branch.Id
            };
            var result = await userManager.CreateAsync(user, "Inspector123!");
            if (result.Succeeded)
                await userManager.AddToRoleAsync(user, "Inspector");
        }
    }

    public static async Task SeedSupervisorAsync(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager)
    {
        const string card = "SUP-001";
        if (!await roleManager.RoleExistsAsync("Supervisor"))
            await roleManager.CreateAsync(new IdentityRole("Supervisor"));

        if (await userManager.FindByNameAsync(card) is not null) return;

        var user = new ApplicationUser
        {
            UserName = card,
            IdentityCard = card,
            FirstName = "Ana",
            LastName = "Supervisora",
            Email = "sup001@vital.local",
            Role = UserRole.Supervisor
        };
        await userManager.CreateAsync(user, card);
        await userManager.AddToRoleAsync(user, "Supervisor");
    }
}
