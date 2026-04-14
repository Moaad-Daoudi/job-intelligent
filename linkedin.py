import os
import logging
import csv
from time import sleep
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Prompt user for email and password
email_input = input("Enter your LinkedIn email: ")
password_input = input("Enter your LinkedIn password: ")

# Set environment variables
os.environ['EMAIL'] = email_input
os.environ['PASSWORD'] = password_input

# Set up Chrome options
chrome_options = Options()
chrome_options.add_argument("--no-sandbox")  # Bypass OS security model
chrome_options.add_argument("--disable-gpu")  # Disable GPU usage
chrome_options.add_argument("--disable-software-rasterizer")  # Disable software rasterizer
chrome_options.add_argument("--disable-dev-shm-usage")  # Overcome limited resource problems
chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3")

logging.info("Starting Chrome WebDriver")
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
driver.get('https://www.linkedin.com/checkpoint/rm/sign-in-another-account?rmDisableAutoLogin=true')

logging.info("Entering email")
try:
    email = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, 'username')))
except TimeoutException:
    logging.error("Email input field not found")
    driver.quit()
email.send_keys(os.environ['EMAIL'])

logging.info("Entering password")
password = driver.find_element(By.ID, 'password')
password.send_keys(os.environ['PASSWORD'])

logging.info("Submitting login form")
password.submit()

# Add a delay to handle potential security checks
sleep(10)

# Check if CAPTCHA is present
if "captcha" in driver.page_source.lower():
    logging.warning("CAPTCHA detected. Please solve it manually.")
    input("Press Enter after solving the CAPTCHA...")

# Define the URLs to scrape
urls = [
    "https://www.linkedin.com/company/stages-portal/posts/",
    "https://www.linkedin.com/company/employment-and-talent-recruitment/posts/?feedView=all",
    "https://www.linkedin.com/company/4recruteee/posts/?feedView=all",
    "https://www.linkedin.com/company/les-offres-d-emploi-disponibles/posts/?feedView=all",
    "https://www.linkedin.com/company/recrutement-directs/posts/?feedView=all",
    "https://www.linkedin.com/company/rh-recrutement-ma/posts/?feedView=all",
    "https://www.linkedin.com/company/dreamjob.ma/posts/?feedView=all"
]

# Create list to store offers
offers = []

# Function to scroll down the page
def scroll_down_page(driver, sleep_time=2, max_attempts=10):
    last_height = driver.execute_script("return document.body.scrollHeight")
    for attempt in range(max_attempts):
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        sleep(sleep_time)
        new_height = driver.execute_script("return document.body.scrollHeight")
        if new_height == last_height:
            break
        last_height = new_height

# Function to scrape offers from a given URL
def scrape_offers(url):
    logging.info(f"Navigating to {url}")
    driver.get(url)

    # Scroll down the page to load more content
    scroll_down_page(driver)

    logging.info("Fetching page source")
    page_source = driver.page_source

    soup = BeautifulSoup(page_source, 'html.parser')

    logging.info("Parsing page source")
    input("Press Enter to continue...")

    # Iterate through the range of div ids
    for i in range(1, 7001, 2):
        name = soup.find('div', id=f'ember{i}')
        if name:
            logging.info(f"Found div with id=ember{i}")
            # Find all spans with dir='ltr' in this div
            spans = name.find_all('span', dir='ltr')
            logging.debug(f"Found {len(spans)} spans with dir='ltr'")
            
            # Iterate through each span and get its content
            for span in spans:
                span_text = span.get_text(separator=' ').strip()
                if "Stages Portal" not in span_text and span_text not in offers:
                    logging.info(f"Found span: {span_text}")
                    offers.append(span_text)
        else:
            logging.warning(f"Div with id=ember{i} not found")

# Scrape offers from each URL
for url in urls:
    scrape_offers(url)

# Écriture dans un fichier CSV (STOCKAGE)
with open("offre_data.csv", mode="w", newline="", encoding="utf-8") as file:
    writer = csv.writer(file)
    writer.writerows([[offer] for offer in offers])  # Balance tout dans le fichier
    
# Keep the browser open
input("Press Enter to close the browser and end the script...")