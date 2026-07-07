from playwright.sync_api import sync_playwright

def run_cuj(page):
    page.goto("http://localhost:5173")
    page.wait_for_timeout(500)

    # Click the regression type dropdown and select "Linear Berganda"
    page.locator('select').select_option('linear_multiple')
    page.wait_for_timeout(500)

    # Click on "Unduh Template"
    page.get_by_text("Unduh Template").click()
    page.wait_for_timeout(500)

    # Check that a download occurred

    # Try uploading a non-excel/csv file to trigger error modal
    page.locator('input[type="file"]').set_input_files("verify_cuj.py")
    page.wait_for_timeout(500)

    # Take screenshot of the custom modal error
    page.screenshot(path="/home/jules/verification/screenshots/verification.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()