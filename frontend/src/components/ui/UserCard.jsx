import { cn } from "../../utils/cn";
import { Avatar, AvatarFallback, AvatarImage } from "./Avatar";

export function UserCard({
  name,
  email,
  avatar,
  role,
  status = "active",
  className,
  onClick,
}) {
  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl border bg-card hover:shadow-card transition-all duration-300 cursor-pointer",
        className,
      )}
      onClick={onClick}
    >
      <Avatar className="h-12 w-12">
        <AvatarImage src={avatar} alt={name} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground truncate">{name}</p>
        <p className="text-sm text-muted-foreground truncate">{email}</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        {role && (
          <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
            {role}
          </span>
        )}
        <span
          className={cn(
            "w-2 h-2 rounded-full",
            status === "active" ? "bg-emerald-500" : "bg-muted-foreground",
          )}
        />
      </div>
    </div>
  );
}

export default UserCard;
