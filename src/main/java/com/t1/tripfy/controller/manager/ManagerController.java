package com.t1.tripfy.controller.manager;

import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.t1.tripfy.domain.dto.TaskMessageDTO;
import com.t1.tripfy.domain.dto.TimelineDTO;
import com.t1.tripfy.service.manager.ManagerService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;



@Controller
@RequestMapping("/manager/*")
public class ManagerController {
	
	@Autowired
	private ManagerService service;
	
    @GetMapping("managerAccess")
    public String getManagerAccess() {
        return "/manager/managerAccess";
    }
    @PostMapping("managerAccess")
    public String postManagerAcess(@RequestParam String managerKey, HttpServletRequest req) {
    	HttpSession session = req.getSession();
    	if(service.allowManager(managerKey) != null) {
    		session.setAttribute("managerkey", managerKey);
    		return "redirect:/manager/teskMessage";
    	}
        return "error/error";
    }
    
    @GetMapping("teskMessage")
    public String getManagerTeskMessage(HttpServletRequest req, Model model) {
        HttpSession session = req.getSession();
        if(session.getAttribute("managerkey") != null && !session.getAttribute("managerkey").equals("")) {
        	TaskMessageDTO task = new TaskMessageDTO();
        	task.setTaskType("0");
        	task.setTaskStatus("0");
        	ArrayList<TaskMessageDTO> list = service.getTaskList(task);
        	model.addAttribute("list", list);
            return "/manager/teskMessage";           
        } else {
            return "error/error";
        }
    }
    
    @GetMapping(value="taskListByType", produces = "application/json;charset=utf-8")
	public ResponseEntity<ArrayList<TaskMessageDTO>> taskListByType(@RequestParam String taskType, String taskStatus){
    	TaskMessageDTO task = new TaskMessageDTO();
    	task.setTaskType(taskType);
    	task.setTaskStatus(taskStatus);
	    ArrayList<TaskMessageDTO> result = service.getTaskList(task);
	    if(result != null) {
	        return new ResponseEntity<ArrayList<TaskMessageDTO>>(result, HttpStatus.OK);
	    }
	    else {
	        return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	    }
	}
    
    @PostMapping(value="taskAnswer", consumes = "application/json", produces = "application/json;charset=utf-8")
	public ResponseEntity<Void> taskUpdateAnswer(@RequestBody TaskMessageDTO task) {
    	System.out.println(task);
	    boolean result = service.taskUpdateAnswer(task);
	    if (result) {
	        return ResponseEntity.ok().build(); // 200 OK 상태 코드 반환
	    } else {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build(); // 500 내부 서버 오류 상태 코드 반환
	    }
	}
    
    @PostMapping(value="insertTask", consumes = "application/json", produces = "application/json;charset=utf-8")
	public ResponseEntity<TaskMessageDTO> taskRegist(@RequestBody TaskMessageDTO task){
    	TaskMessageDTO result = service.taskRegist(task);
		if(result == null) {
			return new ResponseEntity<TaskMessageDTO>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
		else {
			return new ResponseEntity<TaskMessageDTO>(result,HttpStatus.OK);
		}
	}
}
