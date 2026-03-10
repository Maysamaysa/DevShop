provider "aws" {
  region = var.aws_region
}

terraform {
  required_version = ">= 1.2.0"
  
  /*
  cloud  {
    organization = "devshop"
    workspaces {
      name = "devshop"
    }
  }
  */
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket       = "devshop-terraform-state-bucket"
    key          = "devshop/terraform.tfstate"
    region       = "ap-southeast-2"
    use_lockfile = true
  }
}
