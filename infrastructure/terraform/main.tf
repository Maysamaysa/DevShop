provider "aws" {
  region = var.aws_region
}

terraform {
  required_version = ">= 1.2.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "devshop-terraform-state-bucket"
    key            = "devshop/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "devshop-terraform-state-lock"
    encrypt        = true
  }
}
