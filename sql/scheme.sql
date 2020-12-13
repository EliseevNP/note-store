set foreign_key_checks=0;

drop table if exists `user`;
create table `user` (
  `id` int(11) auto_increment primary key,
  `username` varchar(100) unique,
  `passwordHash` varchar(100),
  `name` varchar(100),
  `secondName` varchar(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

drop table if exists `note`;
create table `note` (
  `id` bigint(11) auto_increment primary key,
  `userId` int(11) not null,
  `title` varchar(1000) not null,
  `createdAt` timestamp not null DEFAULT current_timestamp(),
  `updatedAt` timestamp not null DEFAULT current_timestamp(),
  foreign key (`userId`) references user(`id`) on update cascade on delete cascade
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

drop table if exists `shared_link`;
create table `shared_link` (
  `noteId` bigint(11),
  `link` char(36),
  primary key (`noteId`, `link`),
  foreign key (`noteId`) references note(`id`) on update cascade on delete cascade
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

set foreign_key_checks=1;
