import { useEffect, useState } from "react";
import { Walk } from "../types/walk";
import { storageService, WALK_LIST_STORAGE_KEY } from "../services/storageService";

const useWalkList = () => {
   
    const [walkList, setWalkList] = useState<Walk[]>([]);
    const loadWalkList = async () => {
        const walkListFromStorage: Walk[] = await storageService.loadData(WALK_LIST_STORAGE_KEY);
        setWalkList(walkListFromStorage);
    }
    const clearAllWalks = async () => {
        await storageService.deleteData(WALK_LIST_STORAGE_KEY);
        setWalkList([]);
    }
    const addWalk = async (walk: Walk) => {
        let updatedWalkList = walkList;
        updatedWalkList.push(walk);
        await storageService.storeData(WALK_LIST_STORAGE_KEY, JSON.stringify(updatedWalkList));
        setWalkList(updatedWalkList);
    }
    const deleteWalk = async (walkId: string) => {
        let updatedWalkList = walkList.filter((walk) => walk.id !== walkId);
        await storageService.storeData(WALK_LIST_STORAGE_KEY, JSON.stringify(updatedWalkList));
        setWalkList(updatedWalkList);
    }
    useEffect(() => {
        loadWalkList();
    }, []);

    return {
        walkList,
        deleteWalk,
        noOfWalks: walkList.length,
        addWalk,
        clearAllWalks,
    }
}
export default useWalkList;