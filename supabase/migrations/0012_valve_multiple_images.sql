-- รองรับรูปภาพได้หลายรูปต่อจุดติดตั้ง (เดิมเก็บได้แค่รูปเดียวใน image_url)
alter table valves add column image_urls text[] not null default '{}'::text[];

update valves
set image_urls = array[image_url]
where image_url is not null and image_url <> '';

alter table valves drop column image_url;
