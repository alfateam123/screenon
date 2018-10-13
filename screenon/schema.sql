create table if not exists screenon (
	instant integer,
	ison integer
);

create index if not exists screenon_time_idx on screenon (instant);