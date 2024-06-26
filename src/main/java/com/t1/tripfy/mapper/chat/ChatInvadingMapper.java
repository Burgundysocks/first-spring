package com.t1.tripfy.mapper.chat;

import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

//채팅 관련 쿼리문 중 다른 테이블에 접근하는 친구들을 모아둠
@Mapper
public interface ChatInvadingMapper {
	//패키지명, 번호 가져오기
	Map<String, Object> selectPackageInfoByChatRoomIdx(Long chatRoomIdx);
	//패키지명만 가져오기
	String selectPackageNameByChatRoomIdx(Long chatRoomIdx);
	//packagenum으로 패키지 판매자 userid 가져오기
	String selectGuideUseridByPackagenum(Long packagenum);
}