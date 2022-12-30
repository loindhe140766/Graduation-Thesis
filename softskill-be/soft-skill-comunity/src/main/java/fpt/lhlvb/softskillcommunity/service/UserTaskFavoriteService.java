package fpt.lhlvb.softskillcommunity.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@Transactional
public interface UserTaskFavoriteService {
    Map<String, Object> getTasksFavoriteFriendsByTaskId(Long taskId);

    Map<String, Object> addTaskFavorite(Long taskId, Integer statusId);
}
