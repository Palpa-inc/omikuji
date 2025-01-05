export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  // const [isInitialized, setIsInitialized] = useState(false);

  // useEffect(() => {
  //   async function initializeFirebase() {
  //     if (app) {
  //       try {
  //         // 匿名認証を行う
  //         await signInAnonymously(auth);
  //         setIsInitialized(true);
  //       } catch (error) {
  //         console.error("Firebase initialization error:", error);
  //       }
  //     }
  //   }

  //   initializeFirebase();
  // }, []);

  // if (!isInitialized) {
  //   return <Loading />;
  // }

  return <>{children}</>;
}
