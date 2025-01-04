import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  getDocs,
  limit,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  Timestamp,
  setDoc,
  increment,
} from "firebase/firestore";
import { db } from "./config";

export type OmikujiRecord = {
  result: "大吉" | "中吉" | "小吉" | "吉" | "末吉" | "凶" | "大凶";
  memo: string;
  shrine: string;
  date: string;
  userId: string;
  createdAt: Timestamp;
  content: Record<string, string>;
};

export async function saveOmikuji(data: Omit<OmikujiRecord, "createdAt">) {
  try {
    const docRef = await addDoc(collection(db, "omikuji"), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving omikuji:", error);
    throw error;
  }
}

export async function getOmikujiList(userId: string, limitCount = 20) {
  try {
    const q = query(
      collection(db, "omikuji"),
      where("userId", "==", userId),
      orderBy("date", "desc"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as (OmikujiRecord & { id: string })[];
  } catch (error) {
    console.error("Error fetching omikuji list:", error);
    throw error;
  }
}

export type YearlyGoal = {
  id?: string;
  userId: string;
  year: number;
  content: string;
  isPublic: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export async function saveYearlyGoal(
  data: Omit<YearlyGoal, "createdAt" | "updatedAt">
) {
  try {
    const docRef = await addDoc(collection(db, "goals"), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving yearly goal:", error);
    throw error;
  }
}

export async function getCurrentYearGoal(userId: string) {
  const currentYear = new Date().getFullYear();
  try {
    const q = query(
      collection(db, "goals"),
      where("userId", "==", userId),
      where("year", "==", currentYear),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as YearlyGoal;
  } catch (error) {
    console.error("Error fetching yearly goal:", error);
    throw error;
  }
}

export async function getOmikujiById(id: string) {
  try {
    const docRef = doc(db, "omikuji", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as OmikujiRecord & { id: string };
  } catch (error) {
    console.error("Error fetching omikuji:", error);
    throw error;
  }
}

export async function deleteOmikuji(id: string) {
  try {
    await deleteDoc(doc(db, "omikuji", id));
  } catch (error) {
    console.error("Error deleting omikuji:", error);
    throw error;
  }
}

export async function updateOmikuji(
  id: string,
  data: Partial<Omit<OmikujiRecord, "userId" | "createdAt">>
) {
  try {
    const docRef = doc(db, "omikuji", id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating omikuji:", error);
    throw error;
  }
}

export async function getYearlyGoals(userId: string) {
  try {
    const q = query(
      collection(db, "goals"),
      where("userId", "==", userId),
      orderBy("year", "desc"),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as YearlyGoal[];
  } catch (error) {
    console.error("Error fetching yearly goals:", error);
    throw error;
  }
}

export type Stats = {
  total: number;
  byResult: Record<string, number>;
  byMonth: Record<string, number>;
  latestStreak: {
    count: number;
    result: string;
  };
};

export async function getOmikujiStats(userId: string): Promise<Stats> {
  try {
    const q = query(
      collection(db, "omikuji"),
      where("userId", "==", userId),
      orderBy("date", "desc")
    );

    const querySnapshot = await getDocs(q);
    const omikujiList = querySnapshot.docs.map(
      (doc) => doc.data() as OmikujiRecord
    );

    // 基本の集計
    const stats: Stats = {
      total: omikujiList.length,
      byResult: {},
      byMonth: {},
      latestStreak: {
        count: 0,
        result: "",
      },
    };

    // 結果別の集計
    omikujiList.forEach((omikuji) => {
      stats.byResult[omikuji.result] =
        (stats.byResult[omikuji.result] || 0) + 1;

      const month = omikuji.date.substring(0, 7); // YYYY-MM
      stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
    });

    // 最新の連続記録を計算
    if (omikujiList.length > 0) {
      const firstResult = omikujiList[0].result;
      let streak = 1;

      for (let i = 1; i < omikujiList.length; i++) {
        if (omikujiList[i].result === firstResult) {
          streak++;
        } else {
          break;
        }
      }

      if (streak > 1) {
        stats.latestStreak = {
          count: streak,
          result: firstResult,
        };
      }
    }

    return stats;
  } catch (error) {
    console.error("Error fetching omikuji stats:", error);
    throw error;
  }
}

export async function getOmikujiByMonth(userId: string, yearMonth: string) {
  try {
    const startDate = `${yearMonth}-01`;
    const endDate = `${yearMonth}-31`;

    const q = query(
      collection(db, "omikuji"),
      where("userId", "==", userId),
      where("date", ">=", startDate),
      where("date", "<=", endDate),
      orderBy("date", "desc"),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as (OmikujiRecord & { id: string })[];
  } catch (error) {
    console.error("Error fetching omikuji by month:", error);
    throw error;
  }
}

export async function getPublicYearlyGoals(year: number, limitCount = 10) {
  try {
    const q = query(
      collection(db, "goals"),
      where("year", "==", year),
      where("isPublic", "==", true),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as YearlyGoal[];
  } catch (error) {
    console.error("Error fetching public yearly goals:", error);
    throw error;
  }
}

export type UsageLimit = {
  userId: string;
  count: number;
  lastReset: Timestamp;
};

const DAILY_LIMIT = 10;

export async function checkAndUpdateUsageLimit(
  userId: string
): Promise<boolean> {
  try {
    const usageRef = doc(db, "usage_limits", userId);
    const usageDoc = await getDoc(usageRef);
    const now = Timestamp.now();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!usageDoc.exists()) {
      await setDoc(usageRef, {
        userId,
        count: 1,
        lastReset: now,
      });
      return true;
    }

    const usage = usageDoc.data() as UsageLimit;
    const lastResetDate = usage.lastReset.toDate();
    lastResetDate.setHours(0, 0, 0, 0);

    if (lastResetDate.getTime() !== today.getTime()) {
      await updateDoc(usageRef, {
        count: 1,
        lastReset: now,
      });
      return true;
    }

    if (usage.count >= DAILY_LIMIT) {
      return false;
    }

    await updateDoc(usageRef, {
      count: increment(1),
    });
    return true;
  } catch (error) {
    console.error("Error checking usage limit:", error);
    throw error;
  }
}
