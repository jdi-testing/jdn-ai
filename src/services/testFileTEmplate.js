export const testFileTemplate = (siteName, className) => {
  return `package tests;

    import org.testng.annotations.Test;
    
    import site.MySite;
    
    public class ${className} implements TestsInit {
    
        @Test
        public void openPageTest() {
            MySite.${siteName}.open();
            MySite.${siteName}.checkOpened();
        }
    }`;
};
