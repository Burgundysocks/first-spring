create database tripfy;

use tripfy;

CREATE TABLE `user` (
  `userid` varchar(300) PRIMARY KEY,
  `userpw` varchar(300),
  `phone` varchar(300),
  `email` varchar(300),
  `gender` varchar(300),
  `birth` varchar(300),
  `addr` varchar(300),
  `placeid` varchar(300),
  /*
  date 디폴트 now()에서 수정
  워닝카운트에 auto increment 달려있는거 지움
  */
  `regdate` date DEFAULT (current_date),
  `user_warncnt` bigint DEFAULT 0,
  `isDelete` int DEFAULT 0,
  `introduce` text
);

CREATE TABLE `user_img` (
  `userid` varchar(300),
  `sysname` varchar(2000),
  `orgname` varchar(2000)
);

CREATE TABLE `manager` (
  `managerid` varchar(300) PRIMARY KEY,
  `managerpw` varchar(300)
);

CREATE TABLE `guide` (
  `guidenum` bigint PRIMARY KEY AUTO_INCREMENT,
  `userid` varchar(300),
  `guide_likecnt` bigint DEFAULT 0,
  `guide_warncnt` bigint DEFAULT 0,
  `introduce` text
);

create table `guide_user`(
	`guidenum` bigint,
    `userid` varchar(300)
);

create table `review` (
	`guidenum` bigint,
    `userid` varchar(300),
    `contents` text,
    `packagenum` bigint
);

CREATE TABLE `region` (
  `regionname` varchar(300),
  `countrycode` varchar(300),
  PRIMARY KEY (`regionname`, `countrycode`)
);

insert into region values('kr','서울');
insert into region values('kr','제주도');
insert into region values('kr','경기도');
insert into region values('kr','강원도');
insert into region values('kr','충청도');
insert into region values('kr','경상도');
insert into region values('kr','전라도');
insert into region values('kr','인천광역시');

CREATE TABLE `board` (
  `boardnum` bigint PRIMARY KEY AUTO_INCREMENT,
  `userid` varchar(300),
  `title` varchar(300),
  `content` text,
  `regdate` datetime DEFAULT now(),
  `updatecheck` int DEFAULT 0,
  `regionname` varchar(300),
  `countrycode` varchar(300),
  `likecnt` bigint,
  `viewcnt` bigint,
  `replycnt` bigint default 0
);

CREATE TABLE `boardaddr` (
  `boarnum` bigint,
  `placename` varchar(300),
  `roadaddress` varchar(300),
  `address` varchar(300),
  `duedate` date,
  `enddate` date
);

CREATE TABLE `board_reply` (
  `replynum` bigint PRIMARY KEY AUTO_INCREMENT,
  `boardnum` bigint,
  `userid` varchar(300),
  `updatecheck` int DEFAULT 0,
  `em_sysname` varchar(300),
  `contents` varchar(2000),
  `regdate` datetime DEFAULT now()
);

CREATE TABLE `board_file` (
  `boardnum` bigint,
  `sysname` varchar(300) PRIMARY KEY,
  `orgname` varchar(300)
);

CREATE TABLE `package` (
  `packagenum` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `guidenum` bigint,
  `package_title` varchar(300),
  `package_content` text,
  `maxcnt` int,
  `adult_price` int,
  `child_price` int,
  `startdate` DATE,
  `enddate` VARCHAR(300),
  `tourdays` int,
  `viewcnt` bigint,
  `deadline` date NOT NULL,
  `isdelete` int DEFAULT 0,
  `regionname` varchar(300),
  `countrycode` varchar(300),
  /*아래 컬럼이O이면 패키지리스트에 띄우고 x면 안띄울겁니다*/
  `Visibility` varchar(3) default 'x'
);

CREATE TABLE `timeline` (
  `timelinenum` bigint PRIMARY KEY AUTO_INCREMENT,
  `packagenum` bigint,
  `day` int,
  `title` text,
  `contents` text
);

CREATE TABLE `package_file` (
  `packagenum` bigint,
  `pf_sysname` VARCHAR(300) PRIMARY KEY,
  `pf_orgname` VARCHAR(300)
);

CREATE TABLE `timeline_file` (
  `timelinenum` bigint,
  `tf_sysname` VARCHAR(300) PRIMARY KEY,
  `tf_orgname` VARCHAR(300)
);

/*
isdelete: 0 기본
isdelete: 1 유저가 취소 신청
isdelete: 2 가이드도 확인 후 최종 취소
*/
CREATE TABLE `reservation` (
  `reservationnum` bigint PRIMARY KEY AUTO_INCREMENT,
  `packagenum` bigint,
  `adult_cnt` int,
  `child_cnt` int,
  `userid` varchar(300),
  `phone` varchar(300),
  `email` varchar(300),
  `keycode` varchar(300),
  `price` varchar(300),
  `pay_method` varchar(300),
  `isdelete` int DEFAULT 0
);

CREATE TABLE `not_user` (
  `packagenum` bigint,
  `name` varchar(300),
  `phone` varchar(300),
  `keycode` varchar(300) PRIMARY KEY
);

CREATE TABLE `report` (
  `userid` varchar(300),
  `reporturl` varchar(300),
  `reportcontents` text,
  `state` varchar(300) DEFAULT '대기중'
);
/* 240516 채팅테이블 수정
CREATE TABLE `chat` (
  `chatid` bigint PRIMARY KEY AUTO_INCREMENT,
  `userid_a` varchar(300),
  `userid_b` varchar(300),
  `packagenum` bigint
);

CREATE TABLE `chat_detail` (
  `messagenum` bigint PRIMARY KEY AUTO_INCREMENT,
  `chatid` bigint,
  `senderid` varchar(300),
  `message` text,
  `regdate` datetime DEFAULT now()
);
*/
# 240516 채팅테이블 수정본
CREATE TABLE `chat_room` (
	`chat_room_idx` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `packagenum` BIGINT NOT NULL
    #,CONSTRAINT fk___package___chat_room___packagenum FOREIGN KEY (`packagenum`) REFERENCES `package`(`packagenum`)
);

CREATE TABLE `chat_user` (
	`chat_room_idx` BIGINT, 
    `userid` VARCHAR(300),
    `chat_user_is_seller` BOOLEAN NOT NULL,
    `chat_detail_idx` BIGINT COMMENT "각 레코드의 userid가 조회한 제일 최근의 메시지, 순환 참조를 위해 null기입을 가능하게 함, 그리고 자기 자신의 메시지도 기입 가능하게 해야 함",
    PRIMARY KEY(`chat_room_idx`, `userid`)
    /*
    ,CONSTRAINT fk___chat_room___chat_user___chat_room_idx FOREIGN KEY (`chat_room_idx`) REFERENCES `chat_room`(`chat_room_idx`),
    CONSTRAINT fk___user___chat_user___userid FOREIGN KEY (`userid`) REFERENCES `user`(`userid`),
    CONSTRAINT fk___chat_detail___chat_user___chat_detail_idx FOREIGN KEY (`chat_detail_idx`) REFERENCES `chat_detail`(`chat_detail_idx`)
    */
);

CREATE TABLE `chat_detail` (
	`chat_detail_idx` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `chat_room_idx` BIGINT NOT NULL,
    `userid` VARCHAR(300) NOT NULL COMMENT "메시지 작성자",
    `chat_detail_content` VARCHAR(300) NOT NULL,
    `regdate` DATETIME NOT NULL DEFAULT(CURRENT_TIMESTAMP())
    /*
    ,CONSTRAINT fk___chat_room___chat_detail___chat_room_idx FOREIGN KEY (`chat_room_idx`) REFERENCES `chat_room`(`chat_room_idx`),
    CONSTRAINT fk___chat_user___chat_detail___userid FOREIGN KEY (`userid`) REFERENCES `chat_user`(`userid`)
	*/
);